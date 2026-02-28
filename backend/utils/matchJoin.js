export const noMatchProgress = (match, runtime) => {
  const persistedMoves = Number(match.player1Moves || 0) + Number(match.player2Moves || 0);
  const runtimeMoves = runtime
    ? Number(runtime.stats?.player1?.moves || 0) + Number(runtime.stats?.player2?.moves || 0)
    : 0;
  return !match.winner && !match.endTime && persistedMoves === 0 && runtimeMoves === 0;
};

export const getJoinBlockReason = ({ match, runtime }) => {
  if (match.winner || match.endTime) {
    return 'This match is already completed.';
  }

  const persistedMoves = Number(match.player1Moves || 0) + Number(match.player2Moves || 0);
  const runtimeMoves = runtime
    ? Number(runtime.stats?.player1?.moves || 0) + Number(runtime.stats?.player2?.moves || 0)
    : 0;

  if (persistedMoves + runtimeMoves > 0) {
    return 'This match has already started and cannot accept a new player.';
  }

  const player1Connected = Boolean(runtime?.connected?.player1);
  const player2Connected = Boolean(runtime?.connected?.player2);
  if (player1Connected && player2Connected) {
    return 'Both player slots are currently active.';
  }

  return 'Match full.';
};

export const resolveJoinSide = ({ match, playerName, runtime }) => {
  if (match.player1 === playerName) {
    return 'player1';
  }
  if (match.player2 === playerName) {
    return 'player2';
  }

  if (!match.player1) {
    match.player1 = playerName;
    return 'player1';
  }
  if (!match.player2) {
    match.player2 = playerName;
    return 'player2';
  }

  const canReplaceIdleSlot = noMatchProgress(match, runtime);
  if (!canReplaceIdleSlot) {
    return null;
  }

  const player1Connected = Boolean(runtime?.connected?.player1);
  const player2Connected = Boolean(runtime?.connected?.player2);

  if (!player1Connected) {
    match.player1 = playerName;
    return 'player1';
  }
  if (!player2Connected) {
    match.player2 = playerName;
    return 'player2';
  }

  return null;
};

