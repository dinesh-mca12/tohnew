import { Match } from '../models/Match.js';
import { User } from '../models/User.js';

export const joinMatch = async (req, res) => {
  try {
    const { matchId, playerName } = req.body;
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    if (match.player1 !== playerName && match.player2 !== playerName) {
      if (!match.player1) {
        match.player1 = playerName;
      } else if (!match.player2) {
        match.player2 = playerName;
      } else {
        return res.status(400).json({ message: 'Match full.' });
      }
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
