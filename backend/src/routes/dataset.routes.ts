import { Router } from 'express';
import multer from 'multer';
import { Dataset } from '../models/Dataset.model';
import { Queue } from 'bullmq';
import redis from '../config/redis';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const ingestionQueue = new Queue('ingestion', { connection: redis });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const dataset = await Dataset.create({
      name: req.body.name || req.file.originalname,
      filename: req.file.originalname,
      processingStatus: 'pending'
    });

    await ingestionQueue.add('ingestion', {
      datasetId: dataset._id,
      csvData: req.file.buffer.toString()
    });

    res.status(202).json({ 
        message: 'Upload successful, ingestion started',
        datasetId: dataset._id 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/status', async (req, res) => {
    const dataset = await Dataset.findById(req.params.id).select('processingStatus errorMessage');
    res.json(dataset);
});

export default router;
