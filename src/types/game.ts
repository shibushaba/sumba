import type { GameAvailability } from '../game-engine/core/types'

export interface CatalogGame {
  slug: string
  dbId?: string
  name: string
  description: string
  icon: string
  rating: number | null
  ratingCount: number
  minPlayers: number
  maxPlayers: number
  category: string
  createdBy: string
  engine: string
  engineVersion: string
  accentColor?: string
  availability: GameAvailability
  isPublished: boolean
  route: string
  playRoute: string
  detailsRoute: string
  engineInstalled: boolean
}

/** @deprecated Use CatalogGame — kept for GameCard spread compatibility */
export type GameDefinition = CatalogGame & { id: string }

export function toGameCardProps(game: CatalogGame): GameDefinition {
  return { ...game, id: game.slug }
}
