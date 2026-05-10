import { useMemo } from 'react'

export default function Confetti() {
  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f472b6', '#34d399']

  const confettiItems = useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiItems.map((item) => (
        <div
          key={item.id}
          className="absolute animate-confetti"
          style={{
            left: `${item.left}%`,
            top: '-20px',
            backgroundColor: item.color,
            width: `${item.size}px`,
            height: `${item.size}px`,
            borderRadius: item.isCircle ? '50%' : '0',
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        />
      ))}
    </div>
  )
}