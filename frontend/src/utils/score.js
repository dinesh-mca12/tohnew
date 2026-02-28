export const calculateScore = ({ minimumMoves, playerMoves, timeInSeconds }) => {
  if (!playerMoves) {
    return 0;
  }
  const result = ((minimumMoves / playerMoves) * 1000) - timeInSeconds;
  return Math.max(0, Number(result.toFixed(2)));
};

export const calculateAccuracy = ({ minimumMoves, playerMoves }) => {
  if (!playerMoves) {
    return 100;
  }
  return Math.min(100, Number(((minimumMoves / playerMoves) * 100).toFixed(2)));
};
