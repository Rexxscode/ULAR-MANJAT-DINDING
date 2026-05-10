import PropTypes from 'prop-types'
import { SNAKES, LADDERS, WINNING_POSITION } from '../constants/game.js'

const PLAYER_COLOR_MAP = {
  blue: { bg: 'bg-blue-600', ring: 'ring-blue-300', shadow: 'shadow-blue-500/50' },
  amber: { bg: 'bg-amber-500', ring: 'ring-amber-300', shadow: 'shadow-amber-500/50' },
  rose: { bg: 'bg-rose-500', ring: 'ring-rose-300', shadow: 'shadow-rose-500/50' },
  emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-300', shadow: 'shadow-emerald-500/50' },
  violet: { bg: 'bg-violet-500', ring: 'ring-violet-300', shadow: 'shadow-violet-500/50' },
  cyan: { bg: 'bg-cyan-500', ring: 'ring-cyan-300', shadow: 'shadow-cyan-500/50' },
}

export default function BoardCell({ number, row, playersHere, onMoving, isFromCell }) {
  const isSnakeStart = SNAKES[number]
  const isLadderStart = LADDERS[number]
  const isStart = number === 1
  const isEnd = number === WINNING_POSITION
  const isEven = number % 2 === 0

  let bgClass = isEven
    ? 'bg-gradient-to-br from-amber-100 to-yellow-200'
    : 'bg-gradient-to-br from-orange-100 to-red-100'
  let textColor = 'text-slate-700'
  let borderType = 'border-slate-300'

  if (isStart) {
    bgClass = 'bg-gradient-to-br from-green-300 via-green-400 to-emerald-500'
    textColor = 'text-white'
    borderType = 'border-green-500'
  }
  if (isEnd) {
    bgClass = 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500'
    textColor = 'text-white'
    borderType = 'border-amber-500'
  }
  if (isSnakeStart) {
    bgClass = 'bg-gradient-to-br from-red-200 via-red-300 to-rose-400'
    borderType = 'border-red-500'
  }
  if (isLadderStart) {
    bgClass = 'bg-gradient-to-br from-lime-200 via-green-300 to-emerald-400'
    borderType = 'border-green-500'
  }

  const getPlayerColor = (color) => PLAYER_COLOR_MAP[color] || PLAYER_COLOR_MAP.blue

  return (
    <div className={`aspect-square flex flex-col items-center justify-between p-0.5 md:p-1 border-2 ${borderType} rounded-sm ${bgClass} relative overflow-hidden ${isFromCell ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>
      <span className={`text-[6px] md:text-[8px] font-bold ${textColor} leading-none`}>{number}</span>

      {isSnakeStart && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
          <svg viewBox="0 0 50 50" className="w-full h-full">
            <path d="M10,40 Q25,5 40,40" stroke="#dc2626" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="10" cy="40" r="4" fill="#dc2626" />
            <circle cx="40" cy="40" r="4" fill="#dc2626" />
            <circle cx="25" cy="15" r="3" fill="#991b1b" />
            <path d="M22,12 L25,8 L28,12 M23,10 L24,7 L26,10" stroke="#dc2626" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="absolute bottom-0 right-0 bg-red-600 text-white text-[5px] px-1 rounded font-bold">{SNAKES[number]}</span>
        </div>
      )}

      {isLadderStart && (
        <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
          <svg viewBox="0 0 50 50" className="w-full h-full">
            <line x1="12" y1="45" x2="12" y2="8" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
            <line x1="38" y1="45" x2="38" y2="8" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
            <line x1="12" y1="15" x2="38" y2="15" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="25" x2="38" y2="25" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="35" x2="38" y2="35" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="absolute bottom-0 right-0 bg-green-600 text-white text-[5px] px-1 rounded font-bold">{LADDERS[number]}</span>
        </div>
      )}

      {playersHere.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {playersHere.length === 1 ? (
            <div className={`relative ${onMoving === playersHere[0] ? 'animate-bounce' : ''}`}>
              <div className={`w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${getPlayerColor(playersHere[0].color).bg} ${getPlayerColor(playersHere[0].color).shadow}`}>
                <span className="text-white text-[6px] md:text-[8px] lg:text-[10px] font-bold">{playersHere[0].name.charAt(0)}</span>
              </div>
              {onMoving === playersHere[0] && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              )}
            </div>
          ) : (
            <div className="flex gap-0.5">
              {playersHere.map((p, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border border-white shadow flex items-center justify-center ${getPlayerColor(p.color).bg} ${onMoving === p ? 'animate-bounce ring-2 ring-yellow-400' : ''}`}
                >
                  <span className="text-white text-[4px] md:text-[5px] font-bold">{p.name.charAt(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isStart && (
        <div className="absolute top-1 left-1 text-[8px]">🏠</div>
      )}
      {isEnd && (
        <div className="absolute top-1 right-1 text-[8px]">🏆</div>
      )}
    </div>
  )
}

BoardCell.propTypes = {
  number: PropTypes.number.isRequired,
  row: PropTypes.number.isRequired,
  playersHere: PropTypes.array.isRequired,
  onMoving: PropTypes.number,
  isFromCell: PropTypes.bool,
}