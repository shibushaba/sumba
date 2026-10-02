import { getGame, hasGame } from '../game-engine/core/GameRegistry'
import { weightedRatingScore } from '../lib/ratingScore'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { ensureGamesRegistered } from '../games/registerGames'
import { imposterGameDefinition } from '../games/imposter/definition'
import { whoWhereWhatGameDefinition } from '../games/who-where-what/definition'
import { mafiaGameDefinition } from '../games/mafia/definition'
import type {
  GameAvailability,
  GameDefinition,
  ResolvedGame,
} from '../game-engine/core/types'
import type { GameRow } from '../types/database'
import { getGameRatingSummary } from './ratings'
import type { CatalogGame } from '../types/game'

function catalogEntryFromDefinition(
  definition: GameDefinition,
  availability: GameAvailability = 'playable',
): CatalogGame {
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    category: definition.category,
    minPlayers: definition.minPlayers,
    maxPlayers: definition.maxPlayers,
    createdBy: definition.createdBy,
    engine: definition.engine,
    engineVersion: definition.engineVersion,
    accentColor: definition.accentColor,
    rating: null,
    ratingCount: 0,
    availability,
    isPublished: true,
    route: `/games/${definition.slug}`,
    playRoute: `/games/${definition.slug}`,
    detailsRoute: `/games/${definition.slug}/details`,
    engineInstalled: hasGame(definition.slug),
  }
}

function localFallbackCatalog(): CatalogGame[] {
  return [
    catalogEntryFromDefinition(imposterGameDefinition),
    catalogEntryFromDefinition(whoWhereWhatGameDefinition),
    catalogEntryFromDefinition(mafiaGameDefinition),
  ]
}

function resolveAvailability(
  slug: string,
  isPublished: boolean,
): GameAvailability {
  if (!isPublished) return 'unpublished'
  if (!hasGame(slug)) return 'coming_soon'
  return 'playable'
}

function mapRowToCatalog(
  row: GameRow,
  rating: number | null,
  ratingCount: number,
): CatalogGame {
  const slug = row.slug
  const registered = getGame(slug)
  const availability = resolveAvailability(slug, row.is_published)

  return {
    slug,
    dbId: row.id,
    name: row.name,
    description: row.description ?? registered?.description ?? '',
    icon: row.icon ?? registered?.icon ?? '',
    category: row.category ?? registered?.category ?? 'Party',
    minPlayers: row.min_players,
    maxPlayers: row.max_players,
    createdBy: row.created_by ?? registered?.createdBy ?? 'SUMBA',
    engine: row.engine,
    engineVersion: registered?.engineVersion ?? '0.0.0',
    accentColor: registered?.accentColor ?? '#e63946',
    rating,
    ratingCount,
    availability,
    isPublished: row.is_published,
    route: `/games/${slug}`,
    playRoute: `/games/${slug}`,
    detailsRoute: `/games/${slug}/details`,
    engineInstalled: hasGame(slug),
  }
}

export async function fetchCatalogGames(): Promise<CatalogGame[]> {
  ensureGamesRegistered()

  if (!isSupabaseConfigured || !supabase) {
    return localFallbackCatalog()
  }

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_published', true)
    .order('name', { ascending: true })

  if (error || !data?.length) {
    return localFallbackCatalog()
  }

  const catalog = await Promise.all(
    data.map(async (row) => {
      const summary = await getGameRatingSummary(row.id)
      return mapRowToCatalog(row as GameRow, summary.average, summary.count)
    }),
  )

  return catalog.filter((game) => game.availability !== 'unpublished')
}

export function sortCatalogGames(games: CatalogGame[]): CatalogGame[] {
  return [...games].sort((a, b) => {
    const scoreA = weightedRatingScore(a.rating ?? 0, a.ratingCount)
    const scoreB = weightedRatingScore(b.rating ?? 0, b.ratingCount)
    return scoreB - scoreA
  })
}

export async function resolveGameBySlug(slug: string): Promise<ResolvedGame | null> {
  ensureGamesRegistered()
  const games = await fetchCatalogGames()
  const catalog = games.find((g) => g.slug === slug)
  const definition = getGame(slug)

  if (!catalog && !definition) {
    return null
  }

  if (!catalog) {
    if (!definition) return null
    return {
      metadata: definition,
      definition,
      availability: 'playable',
      rating: null,
      ratingCount: 0,
      isPublished: true,
    }
  }

  if (!definition) {
    return {
      metadata: {
        slug: catalog.slug,
        name: catalog.name,
        description: catalog.description,
        icon: catalog.icon,
        category: catalog.category,
        minPlayers: catalog.minPlayers,
        maxPlayers: catalog.maxPlayers,
        createdBy: catalog.createdBy,
        engine: catalog.engine,
        engineVersion: catalog.engineVersion,
        accentColor: catalog.accentColor,
      },
      availability: 'coming_soon',
      dbId: catalog.dbId,
      rating: catalog.rating,
      ratingCount: catalog.ratingCount,
      isPublished: catalog.isPublished,
    }
  }

  return {
    metadata: definition,
    definition,
    availability: catalog.availability,
    dbId: catalog.dbId,
    rating: catalog.rating,
    ratingCount: catalog.ratingCount,
    isPublished: catalog.isPublished,
  }
}

export async function fetchAdminCatalogGames(): Promise<CatalogGame[]> {
  ensureGamesRegistered()
  if (!supabase) return localFallbackCatalog()

  const { data, error } = await supabase.from('games').select('*').order('name')
  if (error || !data) return localFallbackCatalog()

  return Promise.all(
    data.map(async (row) => {
      const summary = await getGameRatingSummary(row.id)
      const item = mapRowToCatalog(row as GameRow, summary.average, summary.count)
      if (!row.is_published) item.availability = 'unpublished'
      return item
    }),
  )
}
