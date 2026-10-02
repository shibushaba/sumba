import type { ComponentType, LazyExoticComponent } from 'react'

export interface GamePlayer {
  id: string
  name: string
}

export type GameSessionStatus = 'idle' | 'active' | 'completed' | 'abandoned'

export interface GameSession<TState = unknown> {
  sessionId: string
  gameSlug: string
  players: GamePlayer[]
  phase: string
  round: number
  startedAt: string | null
  status: GameSessionStatus
  state: TState
}

export interface GameMetadata {
  slug: string
  name: string
  description: string
  icon: string
  category: string
  minPlayers: number
  maxPlayers: number
  createdBy: string
  engine: string
  engineVersion: string
  accentColor?: string
}

export interface GameDefinition extends GameMetadata {
  /** Lazy play surface for the game route */
  Play: LazyExoticComponent<ComponentType> | ComponentType
  /** Optional details page extras */
  Details?: ComponentType
  /** Contributes points to owner leaderboards */
  leaderboardEnabled?: boolean
  /** Player setup uses saved-player autocomplete */
  usesSavedPlayers?: boolean
}

export type GameAvailability =
  | 'playable'
  | 'coming_soon'
  | 'unpublished'
  | 'not_found'

export interface ResolvedGame {
  metadata: GameMetadata
  definition?: GameDefinition
  availability: GameAvailability
  dbId?: string
  rating: number | null
  ratingCount: number
  isPublished: boolean
}

export interface GameResult {
  winnerLabel: string
  summary?: string
}

export interface GameEngine<TState, TAction extends { type: string }> {
  slug: string
  engineVersion: string
  createInitialState: () => TState
  dispatch: (state: TState, action: TAction) => TState
  canDispatch?: (state: TState, action: TAction) => boolean
  isGameOver?: (state: TState) => boolean
  getResult?: (state: TState) => GameResult | null
}
