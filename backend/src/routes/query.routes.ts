import { Router } from 'express';
import { QueryController } from '../controllers/query.controller';

import { optionalAuth } from '../middleware/auth';

const router = Router();
const queryController = new QueryController();

router.post('/', optionalAuth, (req, res) => queryController.submitQuery(req, res));

export default router;
