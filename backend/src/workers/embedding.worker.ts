import { Worker } from 'bullmq';
import redis, { getIsRedisAvailable } from '../config/redis';
import { SchemaEmbedder } from '../pipeline/ingestion/SchemaEmbedder';

export const embeddingWorkerLogic = async (job: { data: any }) => {
  const { datasetId, profiles } = job.data;
  const embedder = new SchemaEmbedder();
  
  await embedder.embedDataset(datasetId, profiles);
  
  return { status: 'completed', datasetId };
};

export const embeddingWorker = getIsRedisAvailable()
  ? new Worker('embedding', embeddingWorkerLogic, { 
      connection: redis, 
      concurrency: 2,
      limiter: {
          max: 10,
          duration: 1000
      }
    })
  : null;
