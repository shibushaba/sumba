import { useEffect, useState } from 'react'
import { imposterGameDefinition } from '../games/imposter/definition'
import { fetchCatalogGames, sortCatalogGames } from '../services/gameCatalog'
import type { CatalogGame } from '../types/game'

const FEATURED_SLUG = imposterGameDefinition.slug

interface GameCatalogState {
  games: CatalogGame[]
  featured: CatalogGame | null
  loading: boolean
  error: string | null
}

export function useGameCatalog(): GameCatalogState {
  const [games, setGames] = useState<CatalogGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const list = sortCatalogGames(await fetchCatalogGames())
        if (!cancelled) setGames(list)
      } catch {
        if (!cancelled) setError('Could not load games.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const featured = games.find((g) => g.slug === FEATURED_SLUG) ?? games[0] ?? null

  return { games, featured, loading, error }
}
