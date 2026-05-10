import { WINNING_POSITION, SNAKES, LADDERS } from '../constants/game.js'

export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export function getAIDelay(difficulty) {
  const delays = {
    [AI_DIFFICULTY.EASY]: { min: 800, max: 1500 },
    [AI_DIFFICULTY.MEDIUM]: { min: 400, max: 800 },
    [AI_DIFFICULTY.HARD]: { min: 200, max: 400 },
  }
  const { min, max } = delays[difficulty] || delays.medium
  return Math.random() * (max - min) + min
}

export function shouldAIRoll(aiDifficulty) {
  const chance = {
    [AI_DIFFICULTY.EASY]: 0.3,
    [AI_DIFFICULTY.MEDIUM]: 0.5,
    [AI_DIFFICULTY.HARD]: 0.7,
  }
  return Math.random() < (chance[aiDifficulty] || 0.5)
}

export function getAIMoveRecommendation(currentPosition, diceValue, difficulty) {
  const nextPosition = currentPosition + diceValue

  if (nextPosition > WINNING_POSITION) {
    return { type: 'bounce', reason: 'Melebihi posisi menang' }
  }

  if (nextPosition === WINNING_POSITION) {
    return { type: 'optimal', reason: 'Langsung menang!' }
  }

  const nextWithSnake = SNAKES[nextPosition]
  const nextWithLadder = LADDERS[nextPosition]

  if (nextWithLadder) {
    if (difficulty === AI_DIFFICULTY.HARD) {
      return { type: 'optimal', reason: 'Naik tangga ke ' + nextWithLadder }
    }
    return { type: 'good', reason: 'Naik tangga' }
  }

  if (nextWithSnake) {
    if (difficulty === AI_DIFFICULTY.HARD) {
      const alternative = findBetterMove(currentPosition, diceValue, difficulty)
      if (alternative) return alternative
    }
    return { type: 'bad', reason: 'Digigit ular' }
  }

  if (diceValue === 6) {
    return { type: 'good', reason: 'Dapat giliran tambahan' }
  }

  return { type: 'normal', reason: 'Move normal' }
}

function findBetterMove(currentPosition, diceValue, difficulty) {
  if (difficulty !== AI_DIFFICULTY.HARD) return null

  for (let i = 1; i <= 6; i++) {
    const pos = currentPosition + i
    if (pos <= WINNING_POSITION && LADDERS[pos]) {
      return { type: 'better', reason: 'Lebih baik pilih ' + i }
    }
  }

  return null
}

export function predictWinner(players, currentPlayerIndex) {
  const player = players[currentPlayerIndex]
  const distanceToWin = WINNING_POSITION - player.position

  const avgRoll = 3.5
  const estimatedTurns = Math.ceil(distanceToWin / avgRoll)

  return { distanceToWin, estimatedTurns, avgRoll }
}