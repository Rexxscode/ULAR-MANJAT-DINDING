export const BOARD_SIZE = 10
export const WINNING_POSITION = 100

export const SNAKES = {
  16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 74: 68, 87: 24, 93: 73, 95: 75, 98: 78,
}

export const LADDERS = {
  1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100,
}

export const PLAYER_COLORS = {
  blue: { bg: 'bg-blue-500', light: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-600', ring: 'ring-blue-400' },
  amber: { bg: 'bg-amber-500', light: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-600', ring: 'ring-amber-400' },
  pink: { bg: 'bg-pink-500', light: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-600', ring: 'ring-pink-400' },
  violet: { bg: 'bg-violet-500', light: 'bg-violet-100', border: 'border-violet-500', text: 'text-violet-600', ring: 'ring-violet-400' },
}

export const DEFAULT_PLAYERS = [
  { name: 'Pemain 1', position: 1, color: 'blue' },
  { name: 'Pemain 2', position: 1, color: 'amber' },
]

export const PLAYER_COLORS_LIST = ['blue', 'amber', 'pink', 'violet']