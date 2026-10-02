import { supabase } from '../lib/supabase'
import type { GameRatingRow, GameRequestRow } from '../types/database'

export async function fetchIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return !error && Boolean(data)
}

export interface AdminDashboardStats {
  totalGames: number
  totalRatings: number
  averageRating: number | null
  pendingIdeas: number
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (!supabase) {
    return {
      totalGames: 0,
      totalRatings: 0,
      averageRating: null,
      pendingIdeas: 0,
    }
  }

  const [gamesRes, ratingsRes, pendingRes] = await Promise.all([
    supabase.from('games').select('id', { count: 'exact', head: true }),
    supabase.from('game_ratings').select('rating'),
    supabase
      .from('game_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const ratings = ratingsRes.data ?? []
  const totalRatings = ratings.length
  const averageRating =
    totalRatings > 0
      ? Math.round(
          (ratings.reduce((sum, row) => sum + row.rating, 0) / totalRatings) *
            10,
        ) / 10
      : null

  return {
    totalGames: gamesRes.count ?? 0,
    totalRatings,
    averageRating,
    pendingIdeas: pendingRes.count ?? 0,
  }
}

export async function fetchAdminRatings(
  starFilter?: number,
): Promise<
  Array<
    GameRatingRow & {
      game_name: string
    }
  >
> {
  if (!supabase) return []

  let query = supabase
    .from('game_ratings')
    .select('id, game_id, rating, feedback, created_at, games(name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (starFilter) {
    query = query.eq('rating', starFilter)
  }

  const { data, error } = await query
  if (error || !data) return []

  return data.map((row) => {
    const games = row.games as { name: string } | { name: string }[] | null
    const gameName = Array.isArray(games) ? games[0]?.name : games?.name
    return {
      id: row.id,
      game_id: row.game_id,
      rating: row.rating,
      feedback: row.feedback,
      device_id: '',
      created_at: row.created_at,
      game_name: gameName ?? 'Unknown',
    }
  })
}

export async function fetchAdminRequestById(
  id: string,
): Promise<GameRequestRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('game_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return data as GameRequestRow
}
