import { BOARD_SIZE, SNAKES, LADDERS } from '../constants/game.js'

export function getCellNumber(row, col) {
  const rowsFromBottom = BOARD_SIZE - 1 - row
  const evenRow = rowsFromBottom % 2 === 0
  return evenRow ? rowsFromBottom * BOARD_SIZE + col + 1 : rowsFromBottom * BOARD_SIZE + (BOARD_SIZE - col)
}

export function generateCells() {
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
    const row = Math.floor(i / BOARD_SIZE)
    const col = i % BOARD_SIZE
    return { row, col, number: getCellNumber(row, col) }
  })
}

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1
}

export function getNextPosition(currentPosition, dice) {
  const newPosition = currentPosition + dice
  if (SNAKES[newPosition]) return { position: SNAKES[newPosition], type: 'snake' }
  if (LADDERS[newPosition]) return { position: LADDERS[newPosition], type: 'ladder' }
  return { position: newPosition, type: 'normal' }
}

export function createInitialPlayers(count = 2, colors) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Pemain ${i + 1}`,
    position: 1,
    color: colors[i],
  }))
}