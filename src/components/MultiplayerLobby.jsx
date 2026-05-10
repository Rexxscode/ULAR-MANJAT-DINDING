import { useState } from 'react'
import PropTypes from 'prop-types'
import { PLAYER_COLORS } from '../constants/game.js'

export default function MultiplayerLobby({ onJoinRoom, onBack }) {
  const [mode, setMode] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [createdRoomCode, setCreatedRoomCode] = useState(null)

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('Masukkan nama kamu dulu!')
      return
    }
    setIsJoining(true)
    setError('')
    try {
      const result = await onJoinRoom({
        name: playerName,
        color: selectedColor,
        isAI: false
      }, 'create')
      if (result.roomCode) {
        setCreatedRoomCode(result.roomCode)
      }
    } catch (e) {
      setError(e.message)
    }
    setIsJoining(false)
  }

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Masukkan nama kamu dulu!')
      return
    }
    if (!roomCode.trim()) {
      setError('Masukkan kode room!')
      return
    }
    setIsJoining(true)
    setError('')
    try {
      await onJoinRoom({
        name: playerName,
        color: selectedColor,
        isAI: false
      }, 'join', roomCode)
    } catch (e) {
      setError(e.message)
    }
    setIsJoining(false)
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl md:text-7xl mb-4">🌐</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Multiplayer
              </span>
            </h1>
            <p className="text-white/70 text-lg">Main bareng teman!</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-xl hover:from-green-400 hover:to-emerald-400 transition-all hover:scale-[1.02]"
            >
              🏠 Buat Room Baru
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold text-xl hover:from-blue-400 hover:to-cyan-400 transition-all hover:scale-[1.02]"
            >
              🚪 Join Room
            </button>
          </div>

          <button
            onClick={onBack}
            className="w-full mt-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all"
          >
            ← Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {mode === 'create' ? 'Buat Room' : 'Join Room'}
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
          <div>
            <label className="text-white text-sm font-bold mb-2 block">Nama Kamu</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="Masukkan nama..."
            />
          </div>

          <div>
            <label className="text-white text-sm font-bold mb-2 block">Pilih Warna</label>
            <div className="flex gap-2">
              {Object.keys(PLAYER_COLORS).map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full ${PLAYER_COLORS[color].bg} ${
                    selectedColor === color ? 'ring-4 ring-white' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {mode === 'join' && (
            <div>
              <label className="text-white text-sm font-bold mb-2 block">Kode Room</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-blue-500 focus:outline-none text-center text-2xl font-bold tracking-widest"
                placeholder="XXXXXX"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={mode === 'create' ? handleCreate : handleJoin}
            disabled={isJoining}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50"
          >
            {isJoining ? 'Memuat...' : mode === 'create' ? '🏠 Buat Room' : '🚪 Join Room'}
          </button>
        </div>

        <button
          onClick={() => { setMode(null); setError(''); }}
          className="w-full mt-4 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all"
        >
          ← Kembali
        </button>

        {createdRoomCode && (
          <div className="mt-6 bg-green-500/20 border-2 border-green-500 rounded-2xl p-6 text-center">
            <p className="text-green-400 font-bold mb-2">Room Dibuat! 🎉</p>
            <p className="text-white/70 text-sm mb-3">Bagikan kode ini ke teman:</p>
            <div className="bg-slate-900 px-6 py-4 rounded-xl">
              <span className="text-4xl font-black text-amber-400 tracking-widest">{createdRoomCode}</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(createdRoomCode)}
              className="mt-3 text-blue-400 text-sm hover:underline"
            >
              📋 Salin Kode
            </button>
            <p className="text-white/50 text-xs mt-4">Tunggu teman join...</p>
          </div>
        )}
      </div>
    </div>
  )
}

MultiplayerLobby.propTypes = {
  onJoinRoom: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
}