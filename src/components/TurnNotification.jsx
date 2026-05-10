import { PLAYER_COLORS } from '../constants/game.js'

export default function TurnNotification({ playerName, playerColor, isExtraTurn, onClose }) {
  const colors = PLAYER_COLORS[playerColor]
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative ${colors.bg} rounded-3xl p-8 shadow-2xl animate-scaleIn mx-4`}>
        <div className="text-center">
          <div className="text-6xl mb-4">{isExtraTurn ? '⭐' : '🔥'}</div>
          <p className="text-white/80 text-xl font-medium mb-2">{isExtraTurn ? 'DADU 6!' : 'GILIRAN'}</p>
          <p className="text-white text-3xl font-black">{playerName}</p>
          {isExtraTurn && <p className="text-white/80 text-lg mt-2">Jalan Lagi!</p>}
          <div className="mt-4 text-white/60 text-sm">Klik untuk melanjutkan</div>
        </div>
      </div>
    </div>
  )
}