import { Router, Request, Response } from 'express';
import { queryEventBus } from '../utils/eventBus';

const router = Router();

router.get('/:queryId', (req: Request, res: Response) => {
  const { queryId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const cleanup = queryEventBus.subscribe(queryId, (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', () => {
    cleanup();
  });
});

export default router;
