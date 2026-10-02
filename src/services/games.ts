import {
  fetchAdminCatalogGames,
  fetchCatalogGames,
  sortCatalogGames,
} from './gameCatalog'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { CatalogGame } from '../types/game'

export {
  fetchCatalogGames,
  fetchAdminCatalogGames,
  resolveGameBySlug,
  sortCatalogGames,
} from './gameCatalog'

export async function fetchPublishedGames(): Promise<CatalogGame[]> {
  return fetchCatalogGames()
}

export function sortGamesByWeightedRating(games: CatalogGame[]): CatalogGame[] {
  return sortCatalogGames(games)
}

export async function resolveGameDbId(slug: string): Promise<string | null> {
  const games = await fetchCatalogGames()
  return games.find((g) => g.slug === slug)?.dbId ?? null
}

export async function fetchAdminGames(): Promise<CatalogGame[]> {
  return fetchAdminCatalogGames()
}

export async function setGamePublished(
  gameDbId: string,
  isPublished: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Not configured' }
  }
  const { error } = await supabase
    .from('games')
    .update({ is_published: isPublished })
    .eq('id', gameDbId)
  if (error) return { ok: false, error: 'Something went wrong. Please try again.' }
  return { ok: true }
}
