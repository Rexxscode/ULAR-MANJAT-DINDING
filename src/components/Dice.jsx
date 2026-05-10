import { PLAYER_COLORS } from '../constants/game.js'

export function Dice({ value, isRolling }) {
  const dots = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[1, 1], [2, 2], [3, 3]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]],
  }

  return (
    <div className={`w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden ${isRolling ? 'animate-spin' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 opacity-20 rounded-2xl"></div>
      {value && (
        <div className="grid grid-cols-3 gap-2 w-12 h-12 relative z-10">
          {Array.from({ length: 9 }).map((_, i) => {
            const row = Math.floor(i / 3) + 1
            const col = (i % 3) + 1
            const hasDot = dots[value]?.some(([r, c]) => r === row && c === col)
            return (
              <div key={i} className={`rounded-full transition-all duration-300 ${hasDot ? 'bg-gradient-to-br from-slate-700 to-slate-900 scale-100' : 'scale-0'}`} style={{ width: '100%', height: '100%' }}></div>
            )
          })}
        </div>
      )}
    </div>
  )
}