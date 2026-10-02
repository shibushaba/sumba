import { normalizePlayerName } from './playerName'
import type { SavedPlayerRecord } from '../players/types'

export function rankSavedPlayerMatch(
  player: SavedPlayerRecord,
  query: string,
): number | null {
  const q = normalizePlayerName(query)
  if (!q) return null
  const norm = player.normalizedName
  if (norm.startsWith(q)) return norm.length === q.length ? 0 : 1
  if (norm.includes(q)) return 2
  return null
}

export function filterSavedPlayerSuggestions(
  players: readonly SavedPlayerRecord[],
  query: string,
  options?: { includeInactive?: boolean; excludeIds?: ReadonlySet<string> },
): SavedPlayerRecord[] {
  const includeInactive = options?.includeInactive ?? false
  const exclude = options?.excludeIds ?? new Set<string>()
  const q = normalizePlayerName(query)

  const pool = players.filter((p) => {
    if (!includeInactive && !p.isActive) return false
    if (exclude.has(p.id)) return false
    return true
  })

  if (!q) {
    return [...pool].sort((a, b) => a.displayName.localeCompare(b.displayName))
  }

  const startsWithMatches: SavedPlayerRecord[] = []
  const containsMatches: SavedPlayerRecord[] = []

  for (const player of pool) {
    const rank = rankSavedPlayerMatch(player, q)
    if (rank === null) continue
    if (rank <= 1) startsWithMatches.push(player)
    else containsMatches.push(player)
  }

  const sortByName = (list: SavedPlayerRecord[]) =>
    [...list].sort((a, b) => a.displayName.localeCompare(b.displayName))

  if (startsWithMatches.length > 0) {
    return sortByName(startsWithMatches)
  }

  return sortByName(containsMatches)
}
