import { PLAYER_COLORS } from '../constants/game.js'

export default function WinnerModal({ player, onPlayAgain, onBackToLobby }) {
  const colors = PLAYER_COLORS[player.color]
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl mx-4 text-center animate-scaleIn">
        <div className="text-6xl mb-4">👑</div>
        <p className="text-slate-600 text-xl font-medium mb-2">SELAMAT!</p>
        <p className={`text-3xl font-black ${colors.text} mb-2`}>{player.name}</p>
        <p className="text-slate-600 text-lg mb-6">MENANG!</p>
        
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-400 transition-all"
          >
            🔄 Main Lagi
          </button>
          <button
            onClick={onBackToLobby}
            className="flex-1 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl font-bold hover:from-slate-400 hover:to-slate-500 transition-all"
          >
            🏠 Lobby
          </button>
        </div>
      </div>
    </div>
  )
}