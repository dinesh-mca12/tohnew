import { Router } from 'express';
import {
  adminLogin,
  createMatch,
  getLeaderboard,
  getLeaderboardCsv,
  getLiveMatches,
  resetTournament,
  startAllMatches,
} from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.use(requireAdminAuth);

router.post('/auth/login', adminLogin);
router.post('/matches', createMatch);
router.get('/matches/live', getLiveMatches);
router.post('/matches/start-all', startAllMatches);
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard.csv', getLeaderboardCsv);
router.post('/reset', resetTournament);

export default router;
