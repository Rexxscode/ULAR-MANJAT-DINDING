import { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import { WINNING_POSITION, SNAKES, LADDERS } from './constants/game.js'
import { generateCells, rollDice } from './utils/gameUtils.js'
import { getAIDelay } from './utils/aiHelper.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useSound } from './hooks/useSound.js'
import { useMultiplayer } from './hooks/useMultiplayer.js'
import Confetti from './components/Confetti.jsx'
import BoardCell from './components/BoardCell.jsx'
import PlayerCard from './components/PlayerCard.jsx'
import Lobby from './components/Lobby.jsx'
import WinnerModal from './components/WinnerModal.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import DiceDots from './components/DiceDots.jsx'
import MultiplayerLobby from './components/MultiplayerLobby.jsx'
import WaitingRoom from './components/WaitingRoom.jsx'

const SNAKE_LIST = Object.entries(SNAKES).map(([from, to]) => ({ from: Number(from), to }))
const LADDER_LIST = Object.entries(LADDERS).map(([from, to]) => ({ from: Number(from), to }))

const DEFAULT_PLAYERS = [
  { name: 'Pemain 1', position: 1, color: 'blue', isAI: false },
  { name: 'Pemain 2', position: 1, color: 'amber', isAI: false },
]

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  animationsEnabled: true,
  aiDifficulty: 'medium',
}

function App() {
  const [savedPlayers, setSavedPlayers] = useLocalStorage('game_players', DEFAULT_PLAYERS)
  const [savedSettings, setSavedSettings] = useLocalStorage('game_settings', DEFAULT_SETTINGS)

  const [players, setPlayers] = useState(savedPlayers)
  const [settings, setSettings] = useState(savedSettings)
  const [gameState, setGameState] = useState('lobby')
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const [gameStatus, setGameStatus] = useState('waiting')
  const [lastMove, setLastMove] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [movingPlayer, setMovingPlayer] = useState(null)
  const [isExtraTurn, setIsExtraTurn] = useState(false)
  const [prevPosition, setPrevPosition] = useState({})
  const [showSettings, setShowSettings] = useState(false)
  const [isAITurn, setIsAITurn] = useState(false)
  const [playMode, setPlayMode] = useState('local')
  const [mpRoomCode, setMpRoomCode] = useState(null)
  const [mpPlayers, setMpPlayers] = useState([])

  const { roomCode, players: mpServerPlayers, isHost, gameStarted, createRoom, joinRoom, startGame: mpStartGame, updateGameState, nextTurn: mpNextTurn, sendMove: mpSendMove, leaveRoom } = useMultiplayer()

  const { play, setEnabled } = useSound()
  const aiTimeoutRef = useRef(null)

  useEffect(() => {
    setEnabled(settings.soundEnabled)
  }, [settings.soundEnabled, setEnabled])

  useEffect(() => {
    setSavedPlayers(players)
  }, [players, setSavedPlayers])

  useEffect(() => {
    setSavedSettings(settings)
  }, [settings, setSavedSettings])

  useEffect(() => {
    if (mpServerPlayers.length > 0) {
      setMpPlayers(mpServerPlayers)
    }
  }, [mpServerPlayers])

  useEffect(() => {
    if (roomCode) {
      setMpRoomCode(roomCode)
    }
  }, [roomCode])

  useEffect(() => {
    if (gameStarted) {
      setGameState('playing')
      setGameStatus('playing')
      setCurrentPlayer(0)
      if (mpServerPlayers.length > 0) {
        setPlayers(mpServerPlayers.map(p => ({ ...p, position: 1 })))
      }
    }
  }, [gameStarted, mpServerPlayers])

  const cells = generateCells()

  const getLeaderboard = () => {
    return [...players]
      .map((p, i) => ({ ...p, originalIndex: i }))
      .sort((a, b) => b.position - a.position)
      .map((p, i) => ({ ...p, rank: i + 1 }))
  }

  const startGame = () => {
    if (players.length < 2) return
    setGameState('playing')
    setGameStatus('playing')
    setCurrentPlayer(0)
    setDiceValue(null)
    setLastMove(null)
    setShowConfetti(false)
    setIsExtraTurn(false)
    setIsAITurn(false)
  }

  const backToLobby = () => {
    setGameState('lobby')
    setGameStatus('waiting')
    setCurrentPlayer(0)
    setDiceValue(null)
    setLastMove(null)
    setShowConfetti(false)
    setIsExtraTurn(false)
    setIsAITurn(false)
    setPlayMode('local')
    setMpRoomCode(null)
    setMpPlayers([])
    leaveRoom()
  }

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [tempRoomCode, setTempRoomCode] = useState(null)

  const handleJoinMultiplayer = async (playerData, mode, code) => {
    try {
      setIsTransitioning(true)
      if (mode === 'create') {
        const result = await createRoom(playerData)
        setTempRoomCode(result.roomCode)
        setTimeout(() => {
          setIsTransitioning(false)
          setPlayMode('multiplayer')
        }, 800)
        return result
      } else {
        const result = await joinRoom(code, playerData)
        setTempRoomCode(result.roomCode)
        setTimeout(() => {
          setIsTransitioning(false)
          setPlayMode('multiplayer')
        }, 800)
        return result
      }
    } catch (e) {
      setIsTransitioning(false)
      console.error('Error joining room:', e)
      throw e
    }
  }

  const handleStartMultiplayer = () => {
    mpStartGame()
  }

  const handleLeaveMultiplayer = () => {
    leaveRoom()
    setPlayMode('local')
    setMpRoomCode(null)
    setMpPlayers([])
  }

  const playAgain = () => {
    setPlayers(players.map(p => ({ ...p, position: 1 })))
    setGameStatus('playing')
    setCurrentPlayer(0)
    setDiceValue(null)
    setLastMove(null)
    setShowConfetti(false)
    setIsExtraTurn(false)
    setIsAITurn(false)
  }

  const finalizeMove = useCallback(() => {
    const dice = rollDice()
    setDiceValue(dice)
    setIsRolling(false)

    const currentP = players[currentPlayer]
    let newPosition = currentP.position + dice
    let moveType = 'normal'

    if (newPosition > WINNING_POSITION) {
      const excess = newPosition - WINNING_POSITION
      newPosition = WINNING_POSITION - excess
      moveType = 'bounce'
    } else if (newPosition === WINNING_POSITION) {
      moveType = 'won'
      setLastMove({ player: currentPlayer, from: currentP.position, to: newPosition, dice, type: moveType })

      const newPlayers = [...players]
      newPlayers[currentPlayer] = { ...currentP, position: newPosition }
      setPlayers(newPlayers)

      if (settings.soundEnabled) {
        setTimeout(() => play('win'), 300)
      }

      setTimeout(() => {
        setGameStatus('finished')
        setShowConfetti(true)
      }, 1500)
      return
    } else if (SNAKES[newPosition]) {
      newPosition = SNAKES[newPosition]
      moveType = 'snake'
      if (settings.soundEnabled) play('snake')
    } else if (LADDERS[newPosition]) {
      newPosition = LADDERS[newPosition]
      moveType = 'ladder'
      if (settings.soundEnabled) play('ladder')
    } else {
      if (settings.soundEnabled) play('move')
    }

    setMovingPlayer(currentPlayer)
    setPrevPosition(prev => ({ ...prev, [currentPlayer]: currentP.position }))

    setTimeout(() => {
      setMovingPlayer(null)
    }, 600)

    setLastMove({ player: currentPlayer, from: currentP.position, to: newPosition, dice, type: moveType })

    const newPlayers = [...players]
    newPlayers[currentPlayer] = { ...currentP, position: newPosition }
    setPlayers(newPlayers)

    if (moveType !== 'won') {
      setIsExtraTurn(dice === 6)
      if (!isExtraTurn && dice !== 6) {
        setTimeout(() => {
          const nextPlayer = (currentPlayer + 1) % players.length
          setCurrentPlayer(nextPlayer)
          setIsExtraTurn(false)
          setIsAITurn(false)
        }, 500)
      } else if (dice === 6) {
        setIsExtraTurn(true)
        if (settings.soundEnabled) play('move')
      }
    }
  }, [players, currentPlayer, isExtraTurn, settings.soundEnabled, play])

  const handleRollDice = useCallback(() => {
    if (gameStatus !== 'playing') return
    setIsRolling(true)
    setMovingPlayer(currentPlayer)

    if (settings.soundEnabled) {
      play('dice')
    }

    let rollCount = 0
    const rollInterval = setInterval(() => {
      setDiceValue(rollDice())
      rollCount++
      if (rollCount >= 25) {
        clearInterval(rollInterval)
        finalizeMove()
      }
    }, 100)
  }, [gameStatus, currentPlayer, settings.soundEnabled, play, finalizeMove])

  useEffect(() => {
    if (gameState !== 'playing' || gameStatus !== 'playing') return

    const currentP = players[currentPlayer]
    if (currentP?.isAI && !isRolling && !isAITurn) {
      setIsAITurn(true)
      const delay = getAIDelay(settings.aiDifficulty)
      aiTimeoutRef.current = setTimeout(() => {
        handleRollDice()
      }, delay)
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
      }
    }
  }, [currentPlayer, gameState, gameStatus, players, settings.aiDifficulty, isRolling, isAITurn, handleRollDice])

  const handleSaveSettings = (newSettings, newPlayers) => {
    setSettings(newSettings)
    setPlayers(newPlayers)
  }

  const getPlayersAtCell = (number) => players.filter(p => p.position === number)
  const getWinner = () => players.find(p => p.position === WINNING_POSITION)

  const isCurrentPlayerAI = players[currentPlayer]?.isAI

  if (playMode === 'mpline') {
    return (
      <MultiplayerLobby
        onJoinRoom={handleJoinMultiplayer}
        onBack={() => setPlayMode('local')}
        isTransitioning={isTransitioning}
        transitionRoomCode={tempRoomCode}
      />
    )
  }

  if (playMode === 'multiplayer' && !gameStarted) {
    return (
      <WaitingRoom
        roomCode={mpRoomCode || roomCode}
        players={mpPlayers}
        isHost={isHost}
        onStartGame={handleStartMultiplayer}
        onLeave={handleLeaveMultiplayer}
      />
    )
  }

  if (gameState === 'lobby') {
    return (
      <Lobby
        players={players}
        setPlayers={setPlayers}
        onStartGame={startGame}
        onOpenSettings={() => setShowSettings(true)}
        onOpenMultiplayer={() => setPlayMode('mpline')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-2">
      <style>{`
        @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 25px rgba(255,255,255,0.6); } }
        .animate-glow { animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes shake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
        players={players}
      />

      {showConfetti && <Confetti />}

      {gameStatus === 'finished' && getWinner() && (
        <WinnerModal
          player={getWinner()}
          onPlayAgain={playAgain}
          onBackToLobby={backToLobby}
        />
      )}

      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-3">
          <button
            onClick={backToLobby}
            className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-xl text-white text-sm font-bold shadow-lg transition-all hover:scale-105"
          >
            ← Lobby
          </button>
          <h1 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 drop-shadow-lg animate-pulse">
            Ular Manjat Dinding
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-xl text-white text-sm font-bold shadow-lg transition-all hover:scale-105"
          >
            ⚙️
          </button>
        </header>

        <div className="flex flex-wrap gap-2 mb-3">
          <div className={`bg-gradient-to-br from-blue-600 to-slate-600 rounded-xl p-3 shadow-lg ${settings.animationsEnabled ? 'animate-glow' : ''}`}>
            <p className="text-white/70 text-xs mb-1">🎯 Giliran</p>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${getPlayerColorClass(players[currentPlayer]?.color)} shadow-lg`}></div>
              <div>
                <p className="text-white font-bold text-sm">
                  {players[currentPlayer]?.name}
                  {players[currentPlayer]?.isAI && ' 🤖'}
                </p>
                <p className="text-white/60 text-xs">Posisi: {players[currentPlayer]?.position}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-3 shadow-lg flex items-center justify-center min-w-[80px]">
            <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner ${isRolling ? 'animate-spin' : 'animate-shake'}`}>
              {diceValue ? (
                <DiceDots value={diceValue} />
              ) : (
                <span className="text-2xl">🎲</span>
              )}
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 shadow-lg">
            <p className="text-yellow-400 text-xs mb-2">🏆 Ranking</p>
            <div className="flex gap-1">
              {getLeaderboard().map(p => (
                <div
                  key={p.originalIndex}
                  className={`flex-1 px-2 py-1 rounded-lg text-center ${p.rank === 1 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' : getPlayerColorClass(p.color)} ${currentPlayer === p.originalIndex ? 'ring-2 ring-white' : ''}`}
                >
                  <p className="text-[10px]">{p.rank === 1 ? '🥇' : p.rank}</p>
                  <p className="text-white text-xs font-bold truncate">{p.name}</p>
                  <p className="text-white text-xs font-black">{p.position}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-2xl p-3 mb-3 shadow-2xl border-4 border-amber-950 overflow-x-auto">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-1">
            <div className="grid grid-cols-10 gap-px min-w-[480px]">
              {cells.map(({ number, row }) => (
                <BoardCell
                  key={number}
                  number={number}
                  row={row}
                  playersHere={getPlayersAtCell(number)}
                  onMoving={movingPlayer}
                  isFromCell={movingPlayer !== null && prevPosition[movingPlayer] === number}
                />
              ))}
            </div>
          </div>
        </div>

        {!isRolling && gameStatus === 'playing' && !isCurrentPlayerAI && (
          <div className="flex justify-center mb-3">
            <button
              onClick={handleRollDice}
              className="px-10 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-2xl font-bold text-xl shadow-2xl hover:from-amber-400 hover:via-orange-400 hover:to-red-400 transition-all hover:scale-105 active:scale-95 animate-pulse"
            >
              🎲 LEMPAR DADU 🎲
            </button>
          </div>
        )}

        {!isRolling && gameStatus === 'playing' && isCurrentPlayerAI && (
          <div className="flex justify-center mb-3">
            <div className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl text-white font-bold animate-pulse">
              🤖 AI sedang berpikir...
            </div>
          </div>
        )}

        {!isRolling && lastMove && (
          <div className="flex justify-center mb-3">
            <div className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl ${settings.animationsEnabled ? 'animate-shake' : ''} ${
              lastMove.type === 'won' ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white' :
              lastMove.type === 'bounce' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
              lastMove.type === 'snake' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' :
              lastMove.type === 'ladder' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
              lastMove.dice === 6 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
              'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }`}>
              {lastMove.type === 'won' ? `🎉 ${players[lastMove.player]?.name} MENANG! 🎉` :
                lastMove.type === 'bounce' ? `🔙 Mundur! ${lastMove.from} → ${lastMove.to}` :
                lastMove.type === 'snake' ? `🐍 ${players[lastMove.player]?.name} digigit ular! ${lastMove.from}→${lastMove.to}` :
                lastMove.type === 'ladder' ? `🪜 ${players[lastMove.player]?.name} naik tangga! ${lastMove.from}→${lastMove.to}` :
                lastMove.dice === 6 ? `⭐ ${players[lastMove.player]?.name} dapat 6! Jalan lagi!` :
                `${players[lastMove.player]?.name}: ${lastMove.from} → ${lastMove.to}`}
              {' '}(🎲{lastMove.dice})
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          {players.map((player, index) => (
            <PlayerCard
              key={index}
              player={player}
              index={index}
              isTurn={currentPlayer === index}
              gameStatus={gameStatus}
            />
          ))}
        </div>

        <details className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl px-4 py-3">
          <summary className="text-white text-sm cursor-pointer list-none flex items-center gap-2">
            <span className="text-xl">🐍</span>
            <span>Ular</span>
            <span className="text-white/50">→</span>
            <span className="text-xl">🪜</span>
            <span>Tangga</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div className="bg-red-500/20 rounded-lg p-2">
              <p className="text-red-400 font-bold mb-1">🐍 Ular (turun)</p>
              {SNAKE_LIST.map(s => (
                <p key={s.from} className="text-red-200">{s.from} → <span className="text-red-400 font-bold">{s.to}</span></p>
              ))}
            </div>
            <div className="bg-green-500/20 rounded-lg p-2">
              <p className="text-green-400 font-bold mb-1">🪜 Tangga (naik)</p>
              {LADDER_LIST.map(l => (
                <p key={l.from} className="text-green-200">{l.from} → <span className="text-green-400 font-bold">{l.to}</span></p>
              ))}
            </div>
          </div>
        </details>

        <p className="text-center text-white/30 text-xs mt-3">🎯 Dapatkan dadu 6 untuk jalan lagi! | 🤖 = AI Player</p>
      </div>
    </div>
  )
}

function getPlayerColorClass(color) {
  const colorMap = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
  }
  return colorMap[color] || 'bg-blue-500'
}

export default App