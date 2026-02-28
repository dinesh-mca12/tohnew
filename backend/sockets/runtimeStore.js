export const activeMatches = new Map();

export const ensureRuntimeMatch = ({ matchId, diskCount, player1, player2 }) => {
  if (!activeMatches.has(matchId)) {
    activeMatches.set(matchId, {
      matchId,
      diskCount,
      player1,
      player2,
      started: false,
      startAt: null,
      ended: false,
      winner: null,
      connected: {
        player1: null,
        player2: null,
      },
      stats: {
        player1: { moves: 0, elapsedSeconds: 0, isCompleted: false, score: 0, accuracy: 100 },
        player2: { moves: 0, elapsedSeconds: 0, isCompleted: false, score: 0, accuracy: 100 },
      },
    });
  }
  return activeMatches.get(matchId);
};
