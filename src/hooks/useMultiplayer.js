import { useState, useEffect, useCallback, useRef } from 'react'
import { db, ref, set, onValue, push, update, remove, onDisconnect } from '../firebase'

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generatePlayerId() {
  return `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function useMultiplayer() {
  const [isConnected, setIsConnected] = useState(true)
  const [roomCode, setRoomCode] = useState(null)
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [error, setError] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gameState, setGameState] = useState(null)
  const [myPlayerId, setMyPlayerId] = useState(null)

  const roomRef = useRef(null)
  const playersRef = useRef([])

  const generateCode = useCallback(() => {
    return generateRoomCode()
  }, [])

  const createRoom = useCallback((playerData) => {
    return new Promise((resolve, reject) => {
      try {
        const code = generateCode()
        const playerId = generatePlayerId()
        setMyPlayerId(playerId)

        const roomData = {
          code,
          hostId: playerId,
          gameStarted: false,
          createdAt: Date.now()
        }

        const playerDataWithId = {
          ...playerData,
          id: playerId,
          position: 1,
          isAI: false
        }

        const roomRefPath = ref(db, `rooms/${code}`)
        set(roomRefPath, roomData).then(() => {
          const playersRefPath = ref(db, `rooms/${code}/players/${playerId}`)
          set(playersRefPath, playerDataWithId).then(() => {
            setRoomCode(code)
            setIsHost(true)
            setPlayers([playerDataWithId])
            playersRef.current = [playerDataWithId]
            setError(null)
            roomRef.current = code

            // Setup disconnect handler
            onDisconnect(ref(db, `rooms/${code}/players/${playerId}`)).remove()

            resolve({ success: true, roomCode: code, players: [playerDataWithId] })
          })
        }).catch(reject)
      } catch (e) {
        setError(e.message)
        reject(e)
      }
    })
  }, [generateCode])

  const joinRoom = useCallback((code, playerData) => {
    return new Promise((resolve, reject) => {
      try {
        const codeUpper = code.toUpperCase()
        const playerId = generatePlayerId()
        setMyPlayerId(playerId)

        const playerDataWithId = {
          ...playerData,
          id: playerId,
          position: 1,
          isAI: false
        }

        const roomPath = ref(db, `rooms/${codeUpper}`)
        
        onValue(roomPath, (snapshot) => {
          const roomData = snapshot.val()
          if (!roomData) {
            setError('Room tidak ditemukan')
            reject(new Error('Room tidak ditemukan'))
            return
          }

          if (roomData.players && Object.keys(roomData.players).length >= 4) {
            setError('Room sudah penuh')
            reject(new Error('Room sudah penuh'))
            return
          }

          const playersPath = ref(db, `rooms/${codeUpper}/players/${playerId}`)
          set(playersPath, playerDataWithId).then(() => {
            setRoomCode(codeUpper)
            setIsHost(false)
            setError(null)
            roomRef.current = codeUpper

            // Setup disconnect handler
            onDisconnect(playersPath).remove()

            resolve({ success: true, roomCode: codeUpper, players: [...(roomData.players ? Object.values(roomData.players) : []), playerDataWithId] })
          }).catch(reject)
        }, { onlyOnce: true })
      } catch (e) {
        setError(e.message)
        reject(e)
      }
    })
  }, [])

  // Listen for players changes
  useEffect(() => {
    if (!roomCode) return

    const playersPath = ref(db, `rooms/${roomCode}/players`)
    const unsubscribe = onValue(playersPath, (snapshot) => {
      const playersData = snapshot.val()
      if (playersData) {
        const playersList = Object.values(playersData)
        playersRef.current = playersList
        setPlayers(playersList)
      }
    })

    return () => unsubscribe()
  }, [roomCode])

  // Listen for game started and auto-sync turn after moves
  useEffect(() => {
    if (!roomCode) return

    const roomPath = ref(db, `rooms/${roomCode}`)
    const unsubscribe = onValue(roomPath, (snapshot) => {
      const roomData = snapshot.val()
      if (roomData?.gameStarted) {
        setGameStarted(true)
      } else {
        setGameStarted(false)
      }
      if (roomData?.currentPlayer !== undefined) {
        setCurrentPlayerIndex(roomData.currentPlayer)
      }
      if (roomData?.gameState) {
        setGameState(roomData.gameState)

        // Host auto-syncs turn after any move
        if (isHost && roomData.gameState.lastMove && roomData.gameState.lastMove.player !== undefined) {
          const movePlayer = roomData.gameState.lastMove.player
          const currentTurn = roomData.currentPlayer
          
          // If current turn is still the same as the player who just moved, move to next
          if (movePlayer === currentTurn && roomData.gameState.lastMove.type !== 'won') {
            const nextPlayer = (currentTurn + 1) % playersRef.current.length
            setTimeout(() => {
              const turnPath = ref(db, `rooms/${roomCode}/currentPlayer`)
              set(turnPath, nextPlayer)
              setCurrentPlayerIndex(nextPlayer)
            }, 600)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [roomCode, isHost])

  const startGame = useCallback(() => {
    if (!roomCode || !isHost) return

    const roomPath = ref(db, `rooms/${roomCode}`)
    update(roomPath, { gameStarted: true })
    setGameStarted(true)
  }, [roomCode, isHost])

  const updateGameState = useCallback((gameState) => {
    if (!roomCode || !isHost) return

    const gameStatePath = ref(db, `rooms/${roomCode}/gameState`)
    set(gameStatePath, gameState)
  }, [roomCode, isHost])

  const nextTurn = useCallback((nextPlayerIndex) => {
    if (!roomCode || !isHost) return

    const turnPath = ref(db, `rooms/${roomCode}/currentPlayer`)
    set(turnPath, nextPlayerIndex)
  }, [roomCode, isHost])

  const sendMove = useCallback((moveData) => {
    if (!roomCode) return

    const movesPath = ref(db, `rooms/${roomCode}/moves`)
    push(movesPath, moveData)
  }, [roomCode])

  const leaveRoom = useCallback(() => {
    if (roomCode && myPlayerId) {
      const playerPath = ref(db, `rooms/${roomCode}/players/${myPlayerId}`)
      remove(playerPath)

      // If no more players, clean up room
      if (isHost) {
        const roomPath = ref(db, `rooms/${roomCode}`)
        remove(roomPath)
      }
    }

    setRoomCode(null)
    setPlayers([])
    setIsHost(false)
    setGameStarted(false)
    setMyPlayerId(null)
    playersRef.current = []
    roomRef.current = null
  }, [roomCode, isHost])

  const syncTurn = useCallback((index) => {
    if (!roomCode) return
    const turnPath = ref(db, `rooms/${roomCode}/currentPlayer`)
    set(turnPath, index)
    setCurrentPlayerIndex(index)
  }, [roomCode])

  const syncGameState = useCallback((state) => {
    if (!roomCode) return
    const gameStatePath = ref(db, `rooms/${roomCode}/gameState`)
    set(gameStatePath, state)
    setGameState(state)
  }, [roomCode])

  return {
    isConnected,
    roomCode,
    players,
    isHost,
    error,
    gameStarted,
    currentPlayerIndex,
    gameState,
    myPlayerId,
    createRoom,
    joinRoom,
    startGame,
    updateGameState,
    nextTurn,
    sendMove,
    leaveRoom,
    syncTurn,
    syncGameState
  }
}