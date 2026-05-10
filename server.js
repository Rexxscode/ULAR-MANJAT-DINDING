import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const rooms = new Map()
const roomCodes = new Map()

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('createRoom', (playerData, callback) => {
    let roomCode = generateRoomCode()
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode()
    }

    const room = {
      code: roomCode,
      players: [{ ...playerData, socketId: socket.id, isHost: true }],
      gameState: null,
      currentPlayer: 0,
      created: Date.now()
    }

    rooms.set(roomCode, room)
    roomCodes.set(socket.id, roomCode)
    socket.join(roomCode)

    callback({ success: true, roomCode, room })
    console.log(`Room created: ${roomCode}`)
  })

  socket.on('joinRoom', (roomCode, playerData, callback) => {
    const room = rooms.get(roomCode.toUpperCase())

    if (!room) {
      callback({ success: false, error: 'Room tidak ditemukan' })
      return
    }

    if (room.players.length >= 4) {
      callback({ success: false, error: 'Room sudah penuh (max 4 pemain)' })
      return
    }

    const player = { ...playerData, socketId: socket.id, isHost: false }
    room.players.push(player)
    roomCodes.set(socket.id, roomCode)
    socket.join(roomCode)

    io.to(roomCode).emit('playerJoined', { player, players: room.players })
    callback({ success: true, roomCode: room.code, players: room.players })

    console.log(`Player joined room: ${roomCode}`)
  })

  socket.on('updateGameState', (roomCode, gameState) => {
    const room = rooms.get(roomCode)
    if (room) {
      room.gameState = gameState
      socket.to(roomCode).emit('gameStateUpdated', gameState)
    }
  })

  socket.on('nextTurn', (roomCode, nextPlayerIndex) => {
    io.to(roomCode).emit('turnChanged', nextPlayerIndex)
  })

  socket.on('playerMoved', (roomCode, moveData) => {
    socket.to(roomCode).emit('playerMoved', moveData)
  })

  socket.on('startGame', (roomCode) => {
    io.to(roomCode).emit('gameStarted')
  })

  socket.on('sendMessage', (roomCode, message) => {
    io.to(roomCode).emit('chatMessage', message)
  })

  socket.on('disconnect', () => {
    const roomCode = roomCodes.get(socket.id)
    if (roomCode) {
      const room = rooms.get(roomCode)
      if (room) {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id)
        if (playerIndex !== -1) {
          const player = room.players[playerIndex]
          room.players.splice(playerIndex, 1)
          io.to(roomCode).emit('playerLeft', { player, players: room.players })

          if (room.players.length === 0) {
            rooms.delete(roomCode)
            console.log(`Room deleted: ${roomCode}`)
          } else if (player.isHost) {
            room.players[0].isHost = true
            io.to(roomCode).emit('hostChanged', room.players[0])
          }
        }
      }
      roomCodes.delete(socket.id)
    }
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Multiplayer server running on port ${PORT}`)
})