import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RatingDisplay } from '../components/games/RatingDisplay'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { resolveGameBySlug } from '../services/gameCatalog'
import type { CatalogGame } from '../types/game'
import { GameComingSoonPage } from './GameComingSoonPage'
import { GameNotFoundPage } from './GameNotFoundPage'

export function GameDetailsPage() {
  const { gameSlug = '' } = useParams()
  const [game, setGame] = useState<CatalogGame | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    resolveGameBySlug(gameSlug).then((resolved) => {
      if (cancelled) return
      if (!resolved) {
        setGame(null)
        return
      }
      setGame({
        slug: resolved.metadata.slug,
        name: resolved.metadata.name,
        description: resolved.metadata.description,
        icon: resolved.metadata.icon,
        category: resolved.metadata.category,
        minPlayers: resolved.metadata.minPlayers,
        maxPlayers: resolved.metadata.maxPlayers,
        createdBy: resolved.metadata.createdBy,
        engine: resolved.metadata.engine,
        engineVersion: resolved.metadata.engineVersion,
        accentColor: resolved.metadata.accentColor,
        rating: resolved.rating,
        ratingCount: resolved.ratingCount,
        availability: resolved.availability,
        isPublished: resolved.isPublished,
        dbId: resolved.dbId,
        route: `/games/${resolved.metadata.slug}`,
        playRoute: `/games/${resolved.metadata.slug}`,
        detailsRoute: `/games/${resolved.metadata.slug}/details`,
        engineInstalled: resolved.availability === 'playable',
      })
    })
    return () => {
      cancelled = true
    }
  }, [gameSlug])

  if (game === undefined) {
    return <p className="text-sm text-muted">Loading...</p>
  }
  if (!game) return <GameNotFoundPage embedded />
  if (game.availability === 'coming_soon') {
    return <GameComingSoonPage name={game.name} embedded />
  }

  return (
    <div className="page-enter w-full">
      <div className="glass-panel border-2 border-foreground p-6 brutal-shadow">
        <div className="flex items-start justify-between gap-4">
          <span className="text-5xl" aria-hidden>{game.icon}</span>
          <Badge>{game.category}</Badge>
        </div>
        <h1 className="mt-4 font-display text-4xl font-black uppercase">{game.name}</h1>
        <p className="mt-3 text-sm text-muted">{game.description}</p>
        <p className="mt-4 text-sm">
          <RatingDisplay rating={game.rating} ratingCount={game.ratingCount} />
        </p>
        <p className="mt-2 text-sm text-muted">
          {game.minPlayers}–{game.maxPlayers} players · Created by {game.createdBy}
        </p>
        <Link to={game.playRoute} className="mt-6 block">
          <Button size="lg" fullWidth>Play</Button>
        </Link>
      </div>
    </div>
  )
}
