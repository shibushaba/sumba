import { supabase, isSupabaseConfigured } from '../lib/supabase'

export type LeaderboardPeriod = 'week' | 'all_time'

export interface OwnerLeaderboardRow {
  playerId: string
  displayName: string
  avatarSeed: string
  totalPoints: number
  lastScoredAt: string | null
}

export type FetchLeaderboardResult =
  | { ok: true; rows: OwnerLeaderboardRow[] }
  | { ok: false; reason: 'offline' | 'auth' | 'rpc'; message?: string }

export async function fetchOwnerLeaderboard(
  gameSlug: string | null,
  period: LeaderboardPeriod,
): Promise<FetchLeaderboardResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, reason: 'offline' }
  }

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return { ok: false, reason: 'auth' }
  }

  const slug =
    gameSlug && gameSlug.trim().length > 0 ? gameSlug.trim() : null

  const { data, error } = await supabase.rpc('get_owner_leaderboard', {
    p_game_slug: slug,
    p_period: period === 'all_time' ? 'all_time' : 'week',
  })

  if (error) {
    console.error(error)
    return { ok: false, reason: 'rpc', message: error.message }
  }

  const rows = (data ?? []).map((row: Record<string, unknown>) => ({
    playerId: row.player_id as string,
    displayName: row.display_name as string,
    avatarSeed: row.avatar_seed as string,
    totalPoints: Number(row.total_points ?? 0),
    lastScoredAt: (row.last_scored_at as string | null) ?? null,
  }))

  return { ok: true, rows }
}

/** @deprecated Use fetchOwnerLeaderboard and check `.ok` */
export async function fetchOwnerLeaderboardRows(
  gameSlug: string | null,
  period: LeaderboardPeriod,
): Promise<OwnerLeaderboardRow[]> {
  const result = await fetchOwnerLeaderboard(gameSlug, period)
  return result.ok ? result.rows : []
}
