import { Match } from '../models/Match.js';
import { LeaderboardEntry } from '../models/LeaderboardEntry.js';
import { toCsv } from '../utils/csv.js';
import { forceStartMatch } from '../sockets/matchSocket.js';
import { activeMatches } from '../sockets/runtimeStore.js';

export const adminLogin = async (req, res) => {
  return res.json({ ok: true, adminUser: req.adminUser });
};

export const createMatch = async (req, res) => {
  try {
    const { player1 = null, player2 = null, diskCount = 4 } = req.body;
    const match = await Match.create({ player1, player2, diskCount });
    return res.status(201).json(match);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create match.' });
  }
};

export const getLiveMatches = async (_req, res) => {
  try {
    const dbMatches = await Match.find().sort({ createdAt: -1 }).limit(200).lean();
    const payload = dbMatches.map((m) => {
      const runtime = activeMatches.get(String(m._id));
      return {
        ...m,
        started: runtime?.started ?? Boolean(m.startTime),
        ended: runtime?.ended ?? Boolean(m.endTime),
        stats: runtime?.stats || null,
      };
    });
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch live matches.' });
  }
};

export const startAllMatches = async (_req, res) => {
  try {
    const io = _req.app.get('io');
    const pendingMatches = await Match.find({ endTime: null }).lean();
    await Promise.all(pendingMatches.map((m) => forceStartMatch(io, String(m._id))));
    return res.json({ started: pendingMatches.length });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to start all matches.' });
  }
};

export const getLeaderboard = async (_req, res) => {
  try {
    const rows = await LeaderboardEntry.find().sort({ score: -1, time: 1 }).limit(500).lean();
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch leaderboard.' });
  }
};

export const getLeaderboardCsv = async (_req, res) => {
  try {
    const rows = await LeaderboardEntry.find().sort({ score: -1, time: 1 }).lean();
    const csv = toCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leaderboard.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to export leaderboard.' });
  }
};

export const resetTournament = async (_req, res) => {
  try {
    await LeaderboardEntry.deleteMany({});
    await Match.deleteMany({});
    activeMatches.clear();
    return res.json({ message: 'Tournament reset complete.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset tournament.' });
  }
};
