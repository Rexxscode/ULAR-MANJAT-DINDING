import PropTypes from 'prop-types'
import { PLAYER_COLORS } from '../constants/game.js'

export default function WaitingRoom({ roomCode, players, isHost, onStartGame, onLeave }) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    alert('Kode room disalin!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎲</div>
          <h1 className="text-2xl font-black text-white">Tunggu Pemain Lain</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl mb-4">
          <div className="text-center mb-4">
            <p className="text-white/70 text-sm mb-2">Kode Room</p>
            <div className="bg-slate-800 px-6 py-3 rounded-xl">
              <span className="text-4xl font-black text-amber-400 tracking-widest">{roomCode}</span>
            </div>
            <button
              onClick={copyRoomCode}
              className="mt-2 text-blue-400 text-sm hover:underline"
            >
              📋 Salin Kode
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-white/70 text-sm font-bold">Pemain ({players.length}/4)</p>
            {players.map((player, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl ${PLAYER_COLORS[player.color]?.light || 'bg-slate-700'}`}
              >
                <div className={`w-10 h-10 rounded-full ${PLAYER_COLORS[player.color]?.bg || 'bg-blue-500'} flex items-center justify-center`}>
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">
                    {player.name}
                    {player.isHost && <span className="text-amber-400 text-sm ml-2">👑 Host</span>}
                  </p>
                  <p className="text-white/60 text-xs">Siap</p>
                </div>
              </div>
            ))}
            {[...Array(4 - players.length)].map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                  <span className="text-slate-400">?</span>
                </div>
                <p className="text-slate-500">Menunggu pemain...</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {isHost && players.length >= 2 ? (
            <button
              onClick={onStartGame}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-xl hover:from-green-400 hover:to-emerald-400 transition-all"
            >
              🚀 Mulai Game
            </button>
          ) : isHost ? (
            <div className="w-full py-4 bg-slate-700 text-slate-400 rounded-2xl font-bold text-center">
              Perlu minimal 2 pemain
            </div>
          ) : (
            <div className="w-full py-4 bg-slate-700 text-slate-400 rounded-2xl font-bold text-center">
              Menunggu host memulai...
            </div>
          )}
          <button
            onClick={onLeave}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-all"
          >
            ❌ Keluar Room
          </button>
        </div>
      </div>
    </div>
  )
}

WaitingRoom.propTypes = {
  roomCode: PropTypes.string.isRequired,
  players: PropTypes.array.isRequired,
  isHost: PropTypes.bool.isRequired,
  onStartGame: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
}