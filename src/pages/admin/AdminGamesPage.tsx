import { useEffect, useState } from 'react'
import { fetchAdminGames, setGamePublished } from '../../services/games'
import type { CatalogGame } from '../../types/game'
import { Button } from '../../components/ui/Button'
import { RatingDisplay } from '../../components/games/RatingDisplay'

export function AdminGamesPage() {
  const [games, setGames] = useState<CatalogGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminGames().then((data) => {
      setGames(data)
      setLoading(false)
    })
  }, [])

  async function togglePublished(game: CatalogGame) {
    if (!game.dbId) return
    const next = !game.isPublished
    const result = await setGamePublished(game.dbId, next)
    if (result.ok) {
      setGames((prev) =>
        prev.map((g) =>
          g.dbId === game.dbId ? { ...g, isPublished: next } : g,
        ),
      )
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-black uppercase">Games</h2>
      {loading ? <p className="mt-4 text-sm text-muted">Loading games...</p> : null}
      <ul className="mt-6 space-y-4">
        {games.map((game) => (
          <li
            key={game.dbId ?? game.slug}
            className="border-2 border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-black uppercase">
                  {game.icon} {game.name}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Slug: {game.slug} · Engine: {game.engine} v{game.engineVersion}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {game.minPlayers}–{game.maxPlayers} players
                </p>
                {!game.engineInstalled ? (
                  <p className="mt-2 text-xs font-bold uppercase text-primary">
                    Engine not installed
                  </p>
                ) : null}
                <p className="mt-2 text-sm">
                  <RatingDisplay
                    rating={game.rating}
                    ratingCount={game.ratingCount}
                    compact
                  />
                </p>
                <p className="mt-2 text-xs font-bold uppercase">
                  {game.isPublished ? 'Published' : 'Unpublished'}
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => togglePublished(game)}
              >
                {game.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
