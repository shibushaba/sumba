import { fetchOwnerLeaderboard } from './leaderboard'

export interface MafiaLeaderboardRow {
  username: string
  total_points: number
}

export async function fetchMafiaLeaderboard(
  _gameId: string,
): Promise<MafiaLeaderboardRow[]> {
  const result = await fetchOwnerLeaderboard('mafia', 'all_time')
  const rows = result.ok ? result.rows : []
  return rows.map((r) => ({
    username: r.displayName,
    total_points: r.totalPoints,
  }))
}
