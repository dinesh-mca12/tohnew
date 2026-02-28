import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true, trim: true, index: true },
    score: { type: Number, required: true, default: 0 },
    time: { type: Number, required: true, default: 0 },
    moves: { type: Number, required: true, default: 0 },
    matchId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
