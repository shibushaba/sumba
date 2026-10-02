export type GameRequestStatus =
  | 'pending'
  | 'reviewing'
  | 'planned'
  | 'building'
  | 'completed'
  | 'rejected'

export type GamePackType = 'core' | 'malayalam' | 'special'

export interface GameRow {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  category: string | null
  min_players: number
  max_players: number
  created_by: string | null
  engine: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface GameRatingRow {
  id: string
  game_id: string
  rating: number
  feedback: string | null
  device_id: string
  created_at: string
}

export interface GameRatingSummary {
  average: number | null
  count: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export interface GameRequestRow {
  id: string
  title: string | null
  description: string
  voice_path: string | null
  status: GameRequestStatus
  device_id: string | null
  created_at: string
  updated_at: string
}

export interface AdminProfile {
  user_id: string
  role: 'admin'
  created_at: string
}

export interface ProfileRow {
  user_id: string
  username: string
  display_name: string | null
  avatar_seed: string | null
  created_at: string
}

export interface GamePackRow {
  id: string
  slug: string
  name: string
  description: string | null
  pack_type: GamePackType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PackWordRow {
  id: string
  pack_id: string
  word: string
  created_at: string
}

export interface UserPackAccessRow {
  user_id: string
  pack_id: string
  granted_at: string
  granted_by: string | null
}

export interface GameRoundRow {
  id: string
  game_id: string
  pack_id: string | null
  pack_slug: string | null
  round_number: number
  created_by: string
  started_at: string
  completed_at: string | null
  completion_token: string | null
}

export interface GameStatsRow {
  user_id: string
  game_id: string
  total_points: number
  rounds_played: number
  correct_votes: number
  imposter_rounds: number
  imposter_survival_wins: number
  updated_at: string
}
