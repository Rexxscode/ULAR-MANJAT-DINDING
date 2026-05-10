import { PLAYER_COLORS, WINNING_POSITION } from '../constants/game.js'

export default function PlayerCard({ player, index, isTurn, gameStatus }) {
  const colors = PLAYER_COLORS[player.color]
  const isWinning = player.position === WINNING_POSITION
  
  return (
    <div 
      className={`bg-gradient-to-br ${isTurn ? 'from-' + player.color + '-400 to-' + player.color + '-600' : colors.light} rounded-xl p-3 border-2 ${isTurn ? colors.border + ' ring-2 ring-white animate-pulse' : colors.border} shadow-lg hover:scale-105 transition-transform`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-5 h-5 ${colors.bg} rounded-full flex items-center justify-center shadow`}>
          <span className="text-white text-xs font-bold">{index + 1}</span>
        </div>
        <span className={`font-bold text-sm truncate flex-1 ${colors.text}`}>{player.name}</span>
        {isTurn && <span className="text-xs animate-bounce">🎯</span>}
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-2xl font-black ${colors.text}`}>{player.position}</span>
        {isWinning && <span className="text-2xl animate-bounce">👑</span>}
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>0</span>
          <span>100</span>
        </div>
        <div className="h-2 bg-slate-300 rounded-full overflow-hidden">
          <div className={`h-full ${colors.bg} rounded-full transition-all duration-500`} style={{ width: `${player.position}%` }}></div>
        </div>
      </div>
    </div>
  )
}