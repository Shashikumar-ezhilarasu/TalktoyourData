import { Worker } from 'bullmq';
import redis from '../config/redis';
import { SchemaEmbedder } from '../pipeline/ingestion/SchemaEmbedder';

export const embeddingWorker = new Worker('embedding', async (job) => {
  const { datasetId, profiles } = job.data;
  const embedder = new SchemaEmbedder();
  
  await embedder.embedDataset(datasetId, profiles);
  
  return { status: 'completed', datasetId };
}, { 
    connection: redis, 
    concurrency: 2,
    limiter: {
        max: 10, // Max 10 embedding tasks per second to avoid rate limits
        duration: 1000
    }
});
