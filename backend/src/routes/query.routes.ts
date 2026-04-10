import { Router } from 'express';
import { QueryController } from '../controllers/query.controller';

const router = Router();
const queryController = new QueryController();

router.post('/', (req, res) => queryController.submitQuery(req, res));

export default router;
