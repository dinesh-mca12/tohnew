import { Match } from '../models/Match.js';
import { LeaderboardEntry } from '../models/LeaderboardEntry.js';
import { calculateScore } from '../utils/score.js';
import { getAccuracy } from '../utils/gameUtils.js';
import { activeMatches, ensureRuntimeMatch } from './runtimeStore.js';

const roomName = (matchId) => `match:${matchId}`;
const adminRoomName = 'admins:live';
const getAdminCredentials = () => ({
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
});

const buildRoomSnapshot = (runtime) => ({
  matchId: runtime.matchId,
  diskCount: runtime.diskCount,
  started: runtime.started,
  startAt: runtime.startAt,
  ended: runtime.ended,
  winner: runtime.winner,
  stats: runtime.stats,
  players: {
    player1: runtime.player1,
    player2: runtime.player2,
  },
});

export const emitLiveMatches = (io) => {
  const payload = Array.from(activeMatches.values()).map((m) => buildRoomSnapshot(m));
  io.to(adminRoomName).emit('admin:matches', payload);
};

export const forceStartMatch = async (io, matchId) => {
  const match = await Match.findById(matchId);
  if (!match) {
    return null;
  }

  const runtime = ensureRuntimeMatch({
    matchId: String(match._id),
    diskCount: match.diskCount,
    player1: match.player1,
    player2: match.player2,
  });

  if (runtime.started) {
    return runtime;
  }

  const startAt = Date.now() + 3000;
  runtime.started = true;
  runtime.startAt = startAt;
  match.startTime = new Date(startAt);
  await match.save();

  io.to(roomName(matchId)).emit('match:started', { matchId, startAt, diskCount: runtime.diskCount });
  emitLiveMatches(io);
  return runtime;
};

export const registerMatchSocket = (io, socket) => {
  socket.on('admin:auth', ({ username, password }) => {
    const creds = getAdminCredentials();
    const valid = username && password && username === creds.username && password === creds.password;
    if (!valid) {
      socket.emit('admin:auth:error', { message: 'Invalid admin credentials.' });
      return;
    }
    socket.data.isAdmin = true;
    socket.join(adminRoomName);
    socket.emit('admin:auth:ok', { ok: true });
    emitLiveMatches(io);
  });

  socket.on('match:join', async ({ matchId, playerName }) => {
    try {
      const match = await Match.findById(matchId);
      if (!match) {
        socket.emit('match:error', { message: 'Match not found.' });
        return;
      }

      const runtime = ensureRuntimeMatch({
        matchId: String(match._id),
        diskCount: match.diskCount,
        player1: match.player1,
        player2: match.player2,
      });

      let side = null;
      if (match.player1 === playerName) {
        side = 'player1';
      } else if (match.player2 === playerName) {
        side = 'player2';
      } else if (!match.player1) {
        match.player1 = playerName;
        side = 'player1';
      } else if (!match.player2) {
        match.player2 = playerName;
        side = 'player2';
      }

      if (!side) {
        socket.emit('match:error', { message: 'Match already has two players.' });
        return;
      }

      await match.save();

      runtime.player1 = match.player1;
      runtime.player2 = match.player2;
      runtime.connected[side] = socket.id;

      socket.data.matchId = String(match._id);
      socket.data.side = side;
      socket.data.playerName = playerName;

      socket.join(roomName(String(match._id)));
      socket.emit('match:state', {
        ...buildRoomSnapshot(runtime),
        side,
        playerName,
      });
      io.to(roomName(String(match._id))).emit('match:presence', {
        player1Connected: Boolean(runtime.connected.player1),
        player2Connected: Boolean(runtime.connected.player2),
      });
      emitLiveMatches(io);
    } catch (error) {
      socket.emit('match:error', { message: 'Unable to join match.' });
    }
  });

  socket.on('match:start', async ({ matchId }) => {
    await forceStartMatch(io, matchId);
  });

  socket.on('match:progress', async ({ matchId, moves, elapsedSeconds, isCompleted }) => {
    try {
      const side = socket.data.side;
      if (!side) {
        return;
      }

      const runtime = activeMatches.get(String(matchId));
      if (!runtime || runtime.ended) {
        return;
      }

      const accuracy = getAccuracy(runtime.diskCount, moves);
      const score = calculateScore({ diskCount: runtime.diskCount, playerMoves: moves, timeInSeconds: elapsedSeconds });
      runtime.stats[side] = { moves, elapsedSeconds, isCompleted, score, accuracy };

      io.to(roomName(String(matchId))).emit('match:stats', {
        matchId,
        stats: runtime.stats,
      });

      if (isCompleted && !runtime.winner) {
        runtime.winner = socket.data.playerName;
        runtime.ended = true;

        const match = await Match.findById(matchId);
        if (match) {
          match.winner = runtime.winner;
          match.endTime = new Date();
          match.player1Moves = runtime.stats.player1.moves;
          match.player2Moves = runtime.stats.player2.moves;
          match.player1Score = runtime.stats.player1.score;
          match.player2Score = runtime.stats.player2.score;
          await match.save();

          const winnerSide = match.player1 === runtime.winner ? 'player1' : 'player2';
          const winnerStats = runtime.stats[winnerSide];
          await LeaderboardEntry.create({
            playerName: runtime.winner,
            score: winnerStats.score,
            time: winnerStats.elapsedSeconds,
            moves: winnerStats.moves,
            matchId: String(match._id),
          });
        }

        io.to(roomName(String(matchId))).emit('match:winner', {
          matchId,
          winner: runtime.winner,
          stats: runtime.stats,
        });
      }

      emitLiveMatches(io);
    } catch (error) {
      socket.emit('match:error', { message: 'Unable to process match update.' });
    }
  });

  socket.on('disconnect', () => {
    const { matchId, side } = socket.data || {};
    if (!matchId || !side) {
      return;
    }
    const runtime = activeMatches.get(String(matchId));
    if (!runtime) {
      return;
    }
    runtime.connected[side] = null;
    io.to(roomName(String(matchId))).emit('match:presence', {
      player1Connected: Boolean(runtime.connected.player1),
      player2Connected: Boolean(runtime.connected.player2),
    });
    emitLiveMatches(io);
  });
};
