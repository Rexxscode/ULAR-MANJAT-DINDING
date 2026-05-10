import { PLAYER_COLORS } from '../constants/game.js'
import PlayerToken from './PlayerToken'

export function TurnIndicator({ player, gameStatus }) {
  return null
}

export function DiceControl({ diceValue, isRolling }) {
  return null
}

export function GameControls({ gameStatus, onRollDice, onResetGame, isRolling }) {
  return null
}

export function MoveNotification({ lastMove, players }) {
  if (!lastMove) return null
  return null
}