import type {
  SentenceAssignment,
  WhoWhereWhatPlayer,
  WhoWhereWhatResult,
} from './types'

export function shuffleWithRandom<T>(
  items: readonly T[],
  random: () => number,
): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Assigns each result to exactly one player in player order.
 * Result order is shuffled; reading order follows `players`.
 */
export function assignResultsToPlayers(
  results: WhoWhereWhatResult[],
  players: WhoWhereWhatPlayer[],
  random: () => number = Math.random,
): SentenceAssignment[] {
  if (results.length !== players.length) {
    throw new Error('Results and players must be the same length.')
  }
  if (results.length === 0) return []

  const shuffled = shuffleWithRandom(results, random)
  return players.map((player, index) => ({
    playerId: player.id,
    resultId: shuffled[index].id,
  }))
}
