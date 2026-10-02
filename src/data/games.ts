/** @deprecated Use game registry + gameCatalog service */
import { imposterGameDefinition } from '../games/imposter/definition'
import type { CatalogGame } from '../types/game'

export const featuredGameSlug = imposterGameDefinition.slug

export const localGames: CatalogGame[] = [
  {
    slug: imposterGameDefinition.slug,
    name: imposterGameDefinition.name,
    description: imposterGameDefinition.description,
    icon: imposterGameDefinition.icon,
    category: imposterGameDefinition.category,
    minPlayers: imposterGameDefinition.minPlayers,
    maxPlayers: imposterGameDefinition.maxPlayers,
    createdBy: imposterGameDefinition.createdBy,
    engine: imposterGameDefinition.engine,
    engineVersion: imposterGameDefinition.engineVersion,
    accentColor: imposterGameDefinition.accentColor,
    rating: null,
    ratingCount: 0,
    availability: 'playable',
    isPublished: true,
    route: `/games/${imposterGameDefinition.slug}`,
    playRoute: `/games/${imposterGameDefinition.slug}`,
    detailsRoute: `/games/${imposterGameDefinition.slug}/details`,
    engineInstalled: true,
  },
]

export function getLocalGameBySlug(slug: string): CatalogGame | undefined {
  return localGames.find((game) => game.slug === slug)
}
