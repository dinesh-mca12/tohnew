import { getMinimumMoves } from './gameUtils.js';

export const calculateScore = ({ diskCount, playerMoves, timeInSeconds }) => {
  const minimumMoves = getMinimumMoves(diskCount);
  if (!playerMoves) {
    return 0;
  }
  const value = ((minimumMoves / playerMoves) * 1000) - timeInSeconds;
  return Number(Math.max(0, value).toFixed(2));
};
