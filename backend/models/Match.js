import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    player1: { type: String, default: null },
    player2: { type: String, default: null },
    diskCount: { type: Number, required: true, min: 3, max: 8, default: 4 },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    winner: { type: String, default: null },
    player1Moves: { type: Number, default: 0 },
    player2Moves: { type: Number, default: 0 },
    player1Score: { type: Number, default: 0 },
    player2Score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Match = mongoose.model('Match', matchSchema);
