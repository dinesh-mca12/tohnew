export const getMinimumMoves = (diskCount) => (2 ** diskCount) - 1;

export const getAccuracy = (diskCount, playerMoves) => {
  const minMoves = getMinimumMoves(diskCount);
  if (!playerMoves) {
    return 100;
  }
  return Math.min(100, Number(((minMoves / playerMoves) * 100).toFixed(2)));
};
