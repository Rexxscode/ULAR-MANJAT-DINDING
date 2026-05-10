import { useState, useEffect, useCallback, useRef } from 'react'
import Pusher from 'pusher-js'

// Demo credentials - ganti dengan punya kamu dari pusher.com
const PUSHER_KEY = 'demo'
const PUSHER_CLUSTER = 'mt1'

let pusher = null
let channel = null

export function useMultiplayer() {
  const [isConnected, setIsConnected] = useState(false)
  const [roomCode, setRoomCode] = useState(null)
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [error, setError] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [myPlayerInfo, setMyPlayerInfo] = useState(null)

  const playersRef = useRef([])

  useEffect(() => {
    if (!pusher) {
      pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        forceTLS: true
      })
    }

    return () => {
      if (channel) {
        channel.unbind_all()
        channel.unsubscribe()
        channel = null
      }
    }
  }, [])

  const subscribeToRoom = useCallback((code) => {
    if (channel) {
      channel.unbind_all()
      channel.unsubscribe()
    }

    const channelName = `game-${code.toUpperCase()}`
    channel = pusher.subscribe(channelName)

    channel.bind('player-joined', (data) => {
      const currentPlayers = playersRef.current
      const exists = currentPlayers.some(p => p.id === data.player.id)
      if (!exists) {
        const updated = [...currentPlayers, data.player]
        playersRef.current = updated
        setPlayers(updated)
      }
    })

    channel.bind('player-left', (data) => {
      const updated = playersRef.current.filter(p => p.id !== data.playerId)
      playersRef.current = updated
      setPlayers(updated)
    })

    channel.bind('game-started', () => {
      setGameStarted(true)
    })

    channel.bind('player-moved', (data) => {
      window.dispatchEvent(new CustomEvent('syncMove', { detail: data }))
    })

    channel.bind('turn-changed', (data) => {
      window.dispatchEvent(new CustomEvent('syncTurn', { detail: data.nextPlayerIndex }))
    })

    channel.bind('game-state-updated', (data) => {
      window.dispatchEvent(new CustomEvent('syncGameState', { detail: data }))
    })

    channel.bind('host-changed', (data) => {
      if (data.hostId === myPlayerInfo?.id) {
        setIsHost(true)
      }
    })
  }, [myPlayerInfo])

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const createRoom = useCallback((playerData) => {
    return new Promise((resolve, reject) => {
      try {
        const code = generateRoomCode()
        const playerWithId = {
          ...playerData,
          id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          socketId: Date.now()
        }

        setMyPlayerInfo(playerWithId)
        playersRef.current = [playerWithId]
        setPlayers([playerWithId])
        setRoomCode(code)
        setIsHost(true)
        setError(null)

        subscribeToRoom(code)

        resolve({ success: true, roomCode: code, players: [playerWithId] })
      } catch (e) {
        setError(e.message)
        reject(e)
      }
    })
  }, [subscribeToRoom])

  const joinRoom = useCallback((code, playerData) => {
    return new Promise((resolve, reject) => {
      try {
        const codeUpper = code.toUpperCase()
        const playerWithId = {
          ...playerData,
          id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          socketId: Date.now()
        }

        setMyPlayerInfo(playerWithId)
        setRoomCode(codeUpper)
        setIsHost(false)
        setError(null)

        subscribeToRoom(codeUpper)

        // Trigger player joined event via server function would be needed
        // For demo, we'll simulate it
        setPlayers(prev => {
          const updated = [...prev, playerWithId]
          playersRef.current = updated
          return updated
        })

        // Broadcast to other players (via client events - not ideal for production)
        if (channel) {
          channel.trigger('client-player-joined', { player: playerWithId })
        }

        resolve({ success: true, roomCode: codeUpper, players: playersRef.current })
      } catch (e) {
        setError(e.message)
        reject(e)
      }
    })
  }, [subscribeToRoom])

  const startGame = useCallback(() => {
    if (channel && roomCode) {
      channel.trigger('game-started', {})
      setGameStarted(true)
    }
  }, [channel, roomCode])

  const updateGameState = useCallback((gameState) => {
    if (channel) {
      channel.trigger('game-state-updated', gameState)
    }
  }, [channel])

  const nextTurn = useCallback((nextPlayerIndex) => {
    if (channel) {
      channel.trigger('turn-changed', { nextPlayerIndex })
    }
  }, [channel])

  const sendMove = useCallback((moveData) => {
    if (channel) {
      channel.trigger('player-moved', moveData)
    }
  }, [channel])

  const leaveRoom = useCallback(() => {
    if (channel && myPlayerInfo) {
      channel.trigger('player-left', { playerId: myPlayerInfo.id })
    }
    if (channel) {
      channel.unbind_all()
      channel.unsubscribe()
      channel = null
    }
    setRoomCode(null)
    setPlayers([])
    setIsHost(false)
    setGameStarted(false)
    setMyPlayerInfo(null)
    playersRef.current = []
  }, [channel, myPlayerInfo])

  return {
    isConnected: !!pusher,
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