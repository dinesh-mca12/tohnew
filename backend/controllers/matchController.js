import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { activeMatches } from '../sockets/runtimeStore.js';
import mongoose from 'mongoose';
import { getJoinBlockReason, resolveJoinSide } from '../utils/matchJoin.js';

export const joinMatch = async (req, res) => {
  try {
    const matchId = String(req.body?.matchId || '').trim();
    const playerName = String(req.body?.playerName || '').trim();

    if (!matchId || !playerName) {
      return res.status(400).json({ message: 'Match ID and player name are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: 'Invalid match ID format.' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    const runtime = activeMatches.get(String(match._id));
    const side = resolveJoinSide({
      match,
      playerName,
      runtime,
    });

    if (!side) {
      const reason = getJoinBlockReason({ match, runtime });
      return res.status(400).json({
        message: `${reason} Current players: ${match.player1 || '-'} and ${match.player2 || '-'}.`,
      });
    }

    if (match.isModified('player1') || match.isModified('player2')) {
      await match.save();
    }

    await User.updateOne(
      { name: playerName, matchId: String(match._id) },
      { $set: { name: playerName, matchId: String(match._id) } },
      { upsert: true }
    );

    return res.json({
      matchId: String(match._id),
      diskCount: match.diskCount,
      player1: match.player1,
      player2: match.player2,
      side,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to join match.' });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).lean();
    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }
    return res.json(match);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get match.' });
  }
};
