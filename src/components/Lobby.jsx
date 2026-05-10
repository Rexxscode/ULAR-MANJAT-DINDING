import PropTypes from 'prop-types'
import { PLAYER_COLORS, PLAYER_COLORS_LIST } from '../constants/game.js'

export default function Lobby({ players, setPlayers, onStartGame, onOpenSettings }) {
  const addPlayer = () => {
    if (players.length < 4) {
      const newColor = PLAYER_COLORS_LIST.find(
        c => !players.some(p => p.color === c)
      ) || PLAYER_COLORS_LIST[players.length % PLAYER_COLORS_LIST.length]

      setPlayers([...players, {
        name: `Pemain ${players.length + 1}`,
        position: 1,
        color: newColor,
        isAI: false
      }])
    }
  }

  const removePlayer = () => {
    if (players.length > 2) {
      setPlayers(players.slice(0, -1))
    }
  }

  const updatePlayerName = (index, name) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], name: name }
    setPlayers(newPlayers)
  }

  const toggleAI = (index) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], isAI: !newPlayers[index].isAI }
    setPlayers(newPlayers)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl md:text-7xl mb-4 animate-bounce">🎲</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Ular Manjat Dinding
            </span>
          </h1>
          <p className="text-white/70 text-lg">Siapkan permainanmu!</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Daftar Pemain</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={removePlayer}
                disabled={players.length <= 2}
                className="w-10 h-10 bg-red-500/80 hover:bg-red-500 rounded-xl transition-all hover:scale-110 active:scale-95 font-bold text-white"
              >
                −
              </button>
              <span className="w-8 text-center text-white font-bold">{players.length}</span>
              <button
                onClick={addPlayer}
                disabled={players.length >= 4}
                className="w-10 h-10 bg-green-500/80 hover:bg-green-500 rounded-xl transition-all hover:scale-110 active:scale-95 font-bold text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={index}
                className={`${PLAYER_COLORS[player.color]?.light || 'bg-blue-500/20'} rounded-2xl p-4 border-4 ${PLAYER_COLORS[player.color]?.border || 'border-blue-500'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${PLAYER_COLORS[player.color]?.bg || 'bg-blue-500'} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    maxLength={15}
                    className="flex-1 bg-white/50 rounded-xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder={`Pemain ${index + 1}`}
                  />
                  <button
                    onClick={() => toggleAI(index)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      player.isAI
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-white/60 hover:bg-white/30'
                    }`}
                    title={player.isAI ? 'Klik untuk nonaktifkan AI' : 'Klik untukaktifkan AI'}
                  >
                    🤖
                  </button>
                </div>
                {player.isAI && (
                  <p className="text-purple-300 text-xs mt-2 ml-13">🤖 AI Player (otomatis bermain)</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onOpenSettings}
              className="flex-1 py-3 bg-slate-600/80 hover:bg-slate-600 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              ⚙️ Pengaturan
            </button>
            <button
              onClick={onStartGame}
              disabled={players.length < 2}
              className="flex-[2] py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl font-black text-lg hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 MULAI
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-white/50 text-sm">
          <p>2-4 pemain • Sampai kotak 100 untuk menang</p>
          <p className="mt-1">🤖 = AI Player (otomatis bermain)</p>
        </div>
      </div>
    </div>
  )
}

Lobby.propTypes = {
  players: PropTypes.array.isRequired,
  setPlayers: PropTypes.func.isRequired,
  onStartGame: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func,
}