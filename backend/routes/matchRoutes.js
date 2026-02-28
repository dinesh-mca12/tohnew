import { Router } from 'express';
import { getMatchById, joinMatch } from '../controllers/matchController.js';

const router = Router();

router.post('/join', joinMatch);
router.get('/:id', getMatchById);

export default router;
