export const toCsv = (rows) => {
  const header = ['playerName', 'score', 'time', 'moves', 'matchId'];
  const body = rows.map((row) => [
    row.playerName,
    row.score,
    row.time,
    row.moves,
    row.matchId,
  ]);
  return [header, ...body].map((line) => line.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
};
