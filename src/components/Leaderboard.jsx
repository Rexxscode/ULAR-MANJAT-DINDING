import { PLAYER_COLORS } from '../constants/game.js'

export default function Leaderboard({ players }) {
  const ranked = [...players]
    .map((p, i) => ({ ...p, index: i }))
    .sort((a, b) => b.position - a.position)
    .map((p, i) => ({ ...p, rank: i + 1 }))

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 md:p-3 border border-white/20 w-32 md:w-40 shrink-0">
      <h3 className="text-white text-xs md:text-sm font-bold text-center mb-1 md:mb-2">🏆 Ranking</h3>
      <div className="space-y-1">
        {ranked.map(p => (
          <div 
            key={p.index}
            className={`flex items-center gap-1 p-1 rounded ${PLAYER_COLORS[p.color].light} border ${PLAYER_COLORS[p.color].border}`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center ${p.rank <= 3 ? 'bg-yellow-400' : 'bg-slate-300'}`}>
              <span className={`text-[8px] font-bold ${p.rank <= 3 ? 'text-yellow-800' : 'text-slate-600'}`}>
                {p.rank <= 3 ? ['🥇','🥈','🥉'][p.rank-1] : p.rank}
              </span>
            </span>
            <span className={`font-bold text-[10px] md:text-xs truncate ${PLAYER_COLORS[p.color].text} flex-1`}>{p.name}</span>
            <span className="font-black text-xs">{p.position}</span>
          </div>
        ))}
      </div>
    </div>
  )
}