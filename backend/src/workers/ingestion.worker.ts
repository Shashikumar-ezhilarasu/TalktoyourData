import redis, { getIsRedisAvailable } from '../config/redis';
import { Dataset } from '../models/Dataset.model';
import { DataChunk } from '../models/DataChunk.model';
import { Validator } from '../pipeline/ingestion/Validator';
import { PIIScrubber } from '../pipeline/ingestion/PIIScrubber';
import { TypeInferencer } from '../pipeline/ingestion/TypeInferencer';
import { StatProfiler } from '../pipeline/ingestion/StatProfiler';
import { SchemaEmbedder } from '../pipeline/ingestion/SchemaEmbedder';
import Papa from 'papaparse';

import { Worker, Queue } from 'bullmq';

export const ingestionWorkerLogic = async (job: { data: any, updateProgress: (p: number) => Promise<void> }) => {
  const { datasetId, csvData } = job.data;
  const dataset = await Dataset.findById(datasetId);
  if (!dataset) throw new Error('Dataset not found');

  try {
    await job.updateProgress(10);
    
    // 1. Parsing
    const parsed = Papa.parse(csvData, { header: true, dynamicTyping: true, skipEmptyLines: true });
    let rows = parsed.data as Record<string, any>[];
    await job.updateProgress(20);

    // 2. Scrub PII
    const scrubber = new PIIScrubber();
    const scrubbed = await scrubber.scrub(rows);
    rows = scrubbed.cleanData;
    dataset.piiColumnsRedacted = scrubbed.piiColumnsFound;
    await job.updateProgress(40);

    // 3. Type Inference
    const inferencer = new TypeInferencer();
    const profiles = inferencer.infer(rows);
    dataset.columnProfiles = profiles;
    dataset.headers = Object.keys(rows[0]);
    await job.updateProgress(60);

    // 4. Stat Profiling
    const profiler = new StatProfiler();
    const stats = profiler.profile(rows, profiles);
    dataset.statProfile = stats;
    dataset.rowCount = rows.length;
    dataset.columnCount = profiles.length;
    await job.updateProgress(80);

    // 5. Chunking & Storage
    const chunkSize = 1000;
    const chunkCount = Math.ceil(rows.length / chunkSize);
    dataset.isChunked = rows.length > 5000;
    dataset.chunkCount = chunkCount;
    
    for (let i = 0; i < chunkCount; i++) {
        const chunkRows = rows.slice(i * chunkSize, (i + 1) * chunkSize);
        await DataChunk.create({
            datasetId,
            chunkIndex: i,
            rows: chunkRows,
            rowStart: i * chunkSize,
            rowEnd: i * chunkSize + chunkRows.length
        });
    }

    // 6. Finalize meta
    dataset.processingStatus = 'ready';
    dataset.sampleRows = rows.slice(0, 10).map(r => Object.values(r));
    await dataset.save();

    // 7. Trigger Embeddings Job (If Redis is available)
    if (getIsRedisAvailable()) {
        const embeddingQueue = new Queue('embedding', { connection: redis });
        await embeddingQueue.add('embed-schema', { datasetId, profiles });
    } else {
        const embedder = new SchemaEmbedder();
        await embedder.embedDataset(datasetId, profiles);
    }
    
    await job.updateProgress(100);
  } catch (err: any) {
    dataset.processingStatus = 'error';
    dataset.errorMessage = err.message || 'Unknown ingestion error';
    await dataset.save();
    throw err;
  }
};

export const ingestionWorker = getIsRedisAvailable() 
  ? new Worker('ingestion', ingestionWorkerLogic, { connection: redis, concurrency: 3 })
  : null;
