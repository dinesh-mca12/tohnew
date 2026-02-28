import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    matchId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
