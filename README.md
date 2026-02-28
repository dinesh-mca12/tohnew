# Real-Time Tower of Hanoi 1v1 (College Tournament Ready)

A production-focused, simplified real-time Tower of Hanoi 1v1 platform built with:

- Frontend: React + Vite + TailwindCSS + Zustand + Framer Motion + Socket.io-client
- Backend: Node.js + Express + Socket.io + MongoDB Atlas

Supports tournament-style operation with isolated Socket.io rooms and simple admin controls for 50-60 simultaneous matches.

## Features

### Player Game

- Fixed disk count (default 4, configurable per match from backend/admin)
- Minimum moves display (`2^n - 1`)
- Drag and drop gameplay with touch support
- Rule enforcement: only smaller disk over larger disk
- Invalid move feedback:
  - Shake animation
  - Error sound
- Smooth disk stacking animations
- Live stats panel:
  - Timer (`mm:ss`)
  - Move count
  - Minimum moves
  - Score: `(MinimumMoves / PlayerMoves) * 1000 - TimeInSeconds`
  - Accuracy %
  - Completion indicator
- Winner popup with confetti
- Controls:
  - Restart
  - Pause/Resume
  - Toggle sound
  - Toggle dark/light theme
- Responsive layouts for desktop/tablet/mobile portrait/mobile landscape

### Multiplayer (1v1)

- Two players per match
- Both players synced via Socket.io start event
- Each player sees:
  - Their board
  - Opponent move count
  - Opponent timer
  - Opponent completion status
- Real-time events:
  - Create/join room
  - Match start sync
  - Progress updates
  - Winner detection and broadcast
- Efficient room-scoped updates (no polling, no global game-state rerenders)

### Admin Panel

- Create match
- Configure disk count
- Start all matches
- View live matches
- View leaderboard
- Download leaderboard CSV
- Reset tournament

## Project Structure

```text
backend/
  server.js
  config/
  controllers/
  models/
  routes/
  sockets/
  utils/

frontend/
  src/
    components/
    pages/
    hooks/
    store/
    utils/
```

## Database Collections

### Users

- `name`
- `matchId`

### Matches

- `player1`
- `player2`
- `diskCount`
- `startTime`
- `endTime`
- `winner`
- `player1Moves`
- `player2Moves`
- `player1Score`
- `player2Score`

### Leaderboard

- `playerName`
- `score`
- `time`
- `moves`
- `matchId`

## Environment Variables

### Backend (`backend/.env`)

Use `backend/.env.example` as template.

```bash
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/toh-live
CORS_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

### Frontend (`frontend/.env`)

Use `frontend/.env.example` as template.

```bash
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Local Development

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Run backend

```bash
cd backend
npm run dev
```

### 3) Run frontend

```bash
cd frontend
npm run dev
```

Open frontend at `http://localhost:5173`.

## API Summary

### Match APIs

- `POST /api/matches/join`
- `GET /api/matches/:id`

### Admin APIs

- `POST /api/admin/matches`
- `GET /api/admin/matches/live`
- `POST /api/admin/matches/start-all`
- `GET /api/admin/leaderboard`
- `GET /api/admin/leaderboard.csv`
- `POST /api/admin/reset`

## Socket Events

### Client -> Server

- `match:join`
- `match:start`
- `match:progress`

### Server -> Client

- `match:state`
- `match:started`
- `match:stats`
- `match:winner`
- `match:presence`
- `match:error`
- `admin:matches`

## Deployment

### Backend on Render

1. Create new Web Service.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env vars:
   - `MONGODB_URI`
   - `CORS_ORIGINS` (include Vercel URL)
   - `PORT` (optional, Render provides one)
6. Deploy and copy public URL.

Optional blueprint file included: `backend/render.yaml`.

### Frontend on Vercel

1. Import project.
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars:
   - `VITE_API_URL=https://your-render-backend.onrender.com`
   - `VITE_SOCKET_URL=https://your-render-backend.onrender.com`
6. Deploy.

SPA routing support included in `frontend/vercel.json`.

## CORS Setup Notes

Set `CORS_ORIGINS` in backend to comma-separated allowed URLs, for example:

```bash
CORS_ORIGINS=http://localhost:5173,https://toh-live.vercel.app
```

## Production Commands

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Basic Load Testing (60 concurrent matches)

You can run lightweight socket load checks using `autocannon` (HTTP) plus a custom socket script for room joins and progress updates.

### Option A: API sanity load

```bash
npm i -g autocannon
autocannon -c 120 -d 30 https://your-backend.onrender.com/health
```

### Option B: Socket stress script approach

1. Create a script that spawns 120 socket clients.
2. Pair them into 60 match rooms.
3. Emit `match:join`, `match:start`, and periodic `match:progress`.
4. Track server CPU, memory, and average event latency.

Success criteria:

- Stable memory growth
- No room cross-talk
- Winner detection correctness per room
- Acceptable update latency under tournament load

## Notes for Event Ops

- Pre-create match slots from Admin page before event start.
- Use “Start All Matches” for synchronized launch.
- Export leaderboard CSV at any time.
- Reset tournament only between rounds.
