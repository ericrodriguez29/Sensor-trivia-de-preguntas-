import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Multi-player Room State Management
interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  streak: number;
  isReady: boolean;
  isHost: boolean;
  lastAnswerIndex: number | null;
  hasAnsweredCurrent: boolean;
  ws?: WebSocket;
}

interface Room {
  code: string;
  hostId: string;
  category: string;
  state: 'lobby' | 'playing' | 'gameover';
  currentQuestionIndex: number;
  questionIds: string[];
  questionStartTime: number;
  players: Map<string, Player>;
}

const rooms = new Map<string, Room>();

function broadcastRoom(room: Room, type: string, payload: Record<string, unknown> = {}) {
  const message = JSON.stringify({ type, room: serializeRoom(room), ...payload });
  room.players.forEach(player => {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(message);
    }
  });
}

function serializeRoom(room: Room) {
  return {
    code: room.code,
    hostId: room.hostId,
    category: room.category,
    state: room.state,
    currentQuestionIndex: room.currentQuestionIndex,
    questionStartTime: room.questionStartTime,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: p.score,
      streak: p.streak,
      isReady: p.isReady,
      isHost: p.isHost,
      lastAnswerIndex: p.lastAnswerIndex,
      hasAnsweredCurrent: p.hasAnsweredCurrent
    }))
  };
}

// WebSocket Connection Management
wss.on('connection', (ws: WebSocket) => {
  let clientRoomCode: string | null = null;
  let clientPlayerId: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'CREATE_ROOM': {
          const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
          const playerId = msg.playerId || Math.random().toString(36).substring(2, 9);
          clientRoomCode = roomCode;
          clientPlayerId = playerId;

          const hostPlayer: Player = {
            id: playerId,
            name: msg.name || 'Jugador 1',
            avatar: msg.avatar || '🏃',
            color: msg.color || '#06b6d4',
            score: 0,
            streak: 0,
            isReady: true,
            isHost: true,
            lastAnswerIndex: null,
            hasAnsweredCurrent: false,
            ws
          };

          const newRoom: Room = {
            code: roomCode,
            hostId: playerId,
            category: msg.category || 'all',
            state: 'lobby',
            currentQuestionIndex: 0,
            questionIds: [],
            questionStartTime: 0,
            players: new Map([[playerId, hostPlayer]])
          };

          rooms.set(roomCode, newRoom);
          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            room: serializeRoom(newRoom),
            playerId
          }));
          break;
        }

        case 'JOIN_ROOM': {
          const code = (msg.roomCode || '').toUpperCase().trim();
          const room = rooms.get(code);

          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Sala no encontrada. Revisa el código.' }));
            return;
          }

          if (room.state !== 'lobby') {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'La partida ya está en curso.' }));
            return;
          }

          if (room.players.size >= 8) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'La sala está llena (máximo 8 jugadores).' }));
            return;
          }

          const playerId = msg.playerId || Math.random().toString(36).substring(2, 9);
          clientRoomCode = code;
          clientPlayerId = playerId;

          const colors = ['#f43f5e', '#06b6d4', '#f59e0b', '#10b981', '#a855f7', '#ec4899'];
          const randomColor = colors[room.players.size % colors.length];

          const newPlayer: Player = {
            id: playerId,
            name: msg.name || `Jugador ${room.players.size + 1}`,
            avatar: msg.avatar || '⚡',
            color: msg.color || randomColor,
            score: 0,
            streak: 0,
            isReady: true,
            isHost: false,
            lastAnswerIndex: null,
            hasAnsweredCurrent: false,
            ws
          };

          room.players.set(playerId, newPlayer);
          broadcastRoom(room, 'ROOM_UPDATED');
          break;
        }

        case 'UPDATE_CATEGORY': {
          if (!clientRoomCode) return;
          const room = rooms.get(clientRoomCode);
          if (room && room.hostId === clientPlayerId) {
            room.category = msg.category;
            broadcastRoom(room, 'ROOM_UPDATED');
          }
          break;
        }

        case 'START_GAME': {
          if (!clientRoomCode) return;
          const room = rooms.get(clientRoomCode);
          if (room && room.hostId === clientPlayerId) {
            room.state = 'playing';
            room.currentQuestionIndex = 0;
            room.questionStartTime = Date.now();
            room.players.forEach(p => {
              p.score = 0;
              p.streak = 0;
              p.hasAnsweredCurrent = false;
              p.lastAnswerIndex = null;
            });
            broadcastRoom(room, 'GAME_STARTED', { questionSeed: msg.questionSeed || Date.now() });
          }
          break;
        }

        case 'SUBMIT_ANSWER': {
          if (!clientRoomCode || !clientPlayerId) return;
          const room = rooms.get(clientRoomCode);
          if (room && room.state === 'playing') {
            const player = room.players.get(clientPlayerId);
            if (player && !player.hasAnsweredCurrent) {
              player.hasAnsweredCurrent = true;
              player.lastAnswerIndex = msg.optionIndex;

              if (msg.isCorrect) {
                player.score += msg.pointsEarned || 100;
                player.streak += 1;
              } else {
                player.streak = 0;
              }

              broadcastRoom(room, 'PLAYER_ANSWERED', {
                playerId: clientPlayerId,
                playerName: player.name,
                isCorrect: msg.isCorrect,
                points: msg.pointsEarned || 0,
                optionIndex: msg.optionIndex
              });

              // Check if all players answered
              const allAnswered = Array.from(room.players.values()).every(p => p.hasAnsweredCurrent);
              if (allAnswered) {
                broadcastRoom(room, 'ROUND_ALL_ANSWERED');
              }
            }
          }
          break;
        }

        case 'NEXT_QUESTION': {
          if (!clientRoomCode) return;
          const room = rooms.get(clientRoomCode);
          if (room && room.hostId === clientPlayerId && room.state === 'playing') {
            const totalQuestions = msg.totalQuestions || 10;
            if (room.currentQuestionIndex + 1 < totalQuestions) {
              room.currentQuestionIndex += 1;
              room.questionStartTime = Date.now();
              room.players.forEach(p => {
                p.hasAnsweredCurrent = false;
                p.lastAnswerIndex = null;
              });
              broadcastRoom(room, 'NEXT_QUESTION_SYNC', { questionIndex: room.currentQuestionIndex });
            } else {
              room.state = 'gameover';
              broadcastRoom(room, 'GAME_OVER');
            }
          }
          break;
        }

        case 'RESTART_ROOM': {
          if (!clientRoomCode) return;
          const room = rooms.get(clientRoomCode);
          if (room && room.hostId === clientPlayerId) {
            room.state = 'lobby';
            room.currentQuestionIndex = 0;
            room.players.forEach(p => {
              p.score = 0;
              p.streak = 0;
              p.hasAnsweredCurrent = false;
              p.lastAnswerIndex = null;
            });
            broadcastRoom(room, 'ROOM_UPDATED');
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    if (clientRoomCode && clientPlayerId) {
      const room = rooms.get(clientRoomCode);
      if (room) {
        room.players.delete(clientPlayerId);
        if (room.players.size === 0) {
          rooms.delete(clientRoomCode);
        } else {
          // If host left, assign new host
          if (room.hostId === clientPlayerId) {
            const firstRemaining = Array.from(room.players.values())[0];
            if (firstRemaining) {
              room.hostId = firstRemaining.id;
              firstRemaining.isHost = true;
            }
          }
          broadcastRoom(room, 'PLAYER_LEFT', { playerId: clientPlayerId });
        }
      }
    }
  });
});

// REST Health API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

// Vite dev middleware or static serve
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`EduFit Bubble Sensor server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
