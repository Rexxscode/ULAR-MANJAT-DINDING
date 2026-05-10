import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3001'

export function useMultiplayer() {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [roomCode, setRoomCode] = useState(null)
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [error, setError] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    const newSocket = io(SOCKET_URL)

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('playerJoined', ({ player, players: roomPlayers }) => {
      setPlayers(roomPlayers)
    })

    newSocket.on('playerLeft', ({ players: roomPlayers }) => {
      setPlayers(roomPlayers)
    })

    newSocket.on('hostChanged', (newHost) => {
      setIsHost(true)
    })

    newSocket.on('gameStarted', () => {
      setGameStarted(true)
    })

    newSocket.on('gameStateUpdated', (gameState) => {
      // Handle game state sync
      window.dispatchEvent(new CustomEvent('syncGameState', { detail: gameState }))
    })

    newSocket.on('turnChanged', (nextPlayerIndex) => {
      window.dispatchEvent(new CustomEvent('syncTurn', { detail: nextPlayerIndex }))
    })

    newSocket.on('playerMoved', (moveData) => {
      window.dispatchEvent(new CustomEvent('syncMove', { detail: moveData }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const createRoom = useCallback((playerData) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'))
        return
      }

      socket.emit('createRoom', playerData, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode)
          setPlayers(response.room.players)
          setIsHost(true)
          resolve(response)
        } else {
          setError(response.error)
          reject(new Error(response.error))
        }
      })
    })
  }, [socket])

  const joinRoom = useCallback((code, playerData) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'))
        return
      }

      socket.emit('joinRoom', code, playerData, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode)
          setPlayers(response.players)
          setIsHost(false)
          resolve(response)
        } else {
          setError(response.error)
          reject(new Error(response.error))
        }
      })
    })
  }, [socket])

  const startGame = useCallback(() => {
    if (socket && roomCode && isHost) {
      socket.emit('startGame', roomCode)
      setGameStarted(true)
    }
  }, [socket, roomCode, isHost])

  const updateGameState = useCallback((gameState) => {
    if (socket && roomCode) {
      socket.emit('updateGameState', roomCode, gameState)
    }
  }, [socket, roomCode])

  const nextTurn = useCallback((nextPlayerIndex) => {
    if (socket && roomCode) {
      socket.emit('nextTurn', roomCode, nextPlayerIndex)
    }
  }, [socket, roomCode])

  const sendMove = useCallback((moveData) => {
    if (socket && roomCode) {
      socket.emit('playerMoved', roomCode, moveData)
    }
  }, [socket, roomCode])

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setRoomCode(null)
      setPlayers([])
      setIsHost(false)
      setGameStarted(false)
    }
  }, [socket])

  return {
    isConnected,
    roomCode,
    players,
    isHost,
    error,
    gameStarted,
    createRoom,
    joinRoom,
    startGame,
    updateGameState,
    nextTurn,
    sendMove,
    leaveRoom
  }
}