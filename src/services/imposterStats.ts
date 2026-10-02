import { fetchOwnerLeaderboard } from './leaderboard'

export interface LeaderboardRow {
  username: string
  total_points: number
  rounds_played: number
}

export async function fetchImposterLeaderboard(
  _gameId: string,
): Promise<LeaderboardRow[]> {
  const result = await fetchOwnerLeaderboard('imposter', 'all_time')
  const rows = result.ok ? result.rows : []
  return rows.map((r) => ({
    username: r.displayName,
    total_points: r.totalPoints,
    rounds_played: 0,
  }))
}

export async function fetchMyImposterPoints(
  _gameId: string,
  _userId: string,
): Promise<number> {
  const result = await fetchOwnerLeaderboard('imposter', 'all_time')
  const rows = result.ok ? result.rows : []
  const { fetchSelfPlayerId } = await import('./savedPlayers')
  const selfId = await fetchSelfPlayerId()
  if (!selfId) return 0
  return rows.find((r) => r.playerId === selfId)?.totalPoints ?? 0
}
