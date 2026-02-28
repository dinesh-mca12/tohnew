import { create } from 'zustand';
import {
  createInitialTowers,
  getMinimumMoves,
  isCompleted,
  isValidMove,
  moveDisk,
} from '../utils/gameLogic';
import { calculateAccuracy, calculateScore } from '../utils/score';

const defaultDiskCount = 4;

export const useGameStore = create((set, get) => ({
  matchId: '',
  playerName: '',
  side: null,
  diskCount: defaultDiskCount,
  minimumMoves: getMinimumMoves(defaultDiskCount),
  towers: createInitialTowers(defaultDiskCount),
  moveCount: 0,
  elapsedSeconds: 0,
  score: 0,
  accuracy: 100,
  completed: false,
  started: false,
  paused: false,
  soundEnabled: true,
  darkMode: false,
  opponent: {
    moves: 0,
    elapsedSeconds: 0,
    completed: false,
    connected: false,
  },
  winner: null,

  setSession: ({ matchId, playerName, side, diskCount }) =>
    set({
      matchId,
      playerName,
      side,
      diskCount,
      minimumMoves: getMinimumMoves(diskCount),
      towers: createInitialTowers(diskCount),
      moveCount: 0,
      elapsedSeconds: 0,
      score: 0,
      accuracy: 100,
      completed: false,
      started: false,
      paused: false,
      winner: null,
    }),

  setStarted: () => set({ started: true, paused: false }),

  tick: () => {
    const { started, paused, completed, elapsedSeconds } = get();
    if (!started || paused || completed) {
      return;
    }
    set({ elapsedSeconds: elapsedSeconds + 1 });
  },

  togglePause: () => set((state) => ({ paused: !state.paused })),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  toggleTheme: () =>
    set((state) => {
      const next = !state.darkMode;
      document.documentElement.classList.toggle('dark', next);
      return { darkMode: next };
    }),

  applyMove: (fromIndex, toIndex) => {
    const state = get();
    if (!state.started || state.paused || state.completed) {
      return { ok: false };
    }
    if (!isValidMove(state.towers, fromIndex, toIndex)) {
      return { ok: false };
    }
    const nextTowers = moveDisk(state.towers, fromIndex, toIndex);
    const nextMoves = state.moveCount + 1;
    const completed = isCompleted(nextTowers, state.diskCount);
    const score = calculateScore({
      minimumMoves: state.minimumMoves,
      playerMoves: nextMoves,
      timeInSeconds: state.elapsedSeconds,
    });
    const accuracy = calculateAccuracy({ minimumMoves: state.minimumMoves, playerMoves: nextMoves });
    set({
      towers: nextTowers,
      moveCount: nextMoves,
      completed,
      score,
      accuracy,
    });
    return {
      ok: true,
      moveCount: nextMoves,
      elapsedSeconds: state.elapsedSeconds,
      completed,
      score,
      accuracy,
    };
  },

  setOpponentFromStats: (stats, side) =>
    set(() => {
      if (!side) {
        return {};
      }
      const opponentSide = side === 'player1' ? 'player2' : 'player1';
      const opponentStats = stats?.[opponentSide] || {};
      return {
        opponent: {
          moves: opponentStats.moves || 0,
          elapsedSeconds: opponentStats.elapsedSeconds || 0,
          completed: opponentStats.isCompleted || false,
          connected: true,
        },
      };
    }),

  setPresence: ({ player1Connected, player2Connected }) =>
    set((state) => {
      if (!state.side) {
        return {};
      }
      const opponentConnected = state.side === 'player1' ? player2Connected : player1Connected;
      return {
        opponent: {
          ...state.opponent,
          connected: Boolean(opponentConnected),
        },
      };
    }),

  setWinner: (winner) => set({ winner }),

  restartBoard: () =>
    set((state) => ({
      towers: createInitialTowers(state.diskCount),
      moveCount: 0,
      elapsedSeconds: 0,
      score: 0,
      accuracy: 100,
      completed: false,
      paused: false,
      winner: null,
    })),
}));
