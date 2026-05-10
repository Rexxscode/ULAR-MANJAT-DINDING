import PropTypes from 'prop-types'

const DICE_DOTS = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]],
}

export default function DiceDots({ value }) {
  if (!value) return <span className="text-2xl">🎲</span>

  return (
    <div className="grid grid-cols-3 gap-0.5 w-8 h-8">
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3) + 1
        const col = (i % 3) + 1
        const hasDot = DICE_DOTS[value]?.some(([r, c]) => r === row && c === col)
        return (
          <div
            key={i}
            className={`rounded-full ${hasDot ? 'bg-slate-700 scale-100' : 'bg-transparent scale-0'}`}
            style={{ width: '100%', height: '100%' }}
          ></div>
        )
      })}
    </div>
  )
}

DiceDots.propTypes = {
  value: PropTypes.number,
}