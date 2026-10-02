import type { CSSProperties } from 'react'
import { Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { GameDefinition } from '../../types/game'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { RatingDisplay } from './RatingDisplay'

export type GameCardProps = GameDefinition & {
  featured?: boolean
}

export function GameCard({
  id,
  name,
  description,
  icon,
  rating,
  ratingCount,
  minPlayers,
  maxPlayers,
  category,
  createdBy,
  accentColor = 'var(--primary)',
  route,
  featured = false,
}: GameCardProps) {
  const shadowStyle = { '--shadow': accentColor } as CSSProperties

  if (featured) {
    return (
      <article
        className="glass-panel brutal-shadow relative overflow-hidden border-2 border-foreground p-5 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] sm:p-6"
        style={shadowStyle}
        aria-labelledby={`game-${id}-title`}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl"
          style={{ background: accentColor }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <span className="text-5xl leading-none" aria-hidden>{icon}</span>
            <Badge>{category}</Badge>
          </div>
          <div>
            <h2
              id={`game-${id}-title`}
              className="font-display text-3xl font-black uppercase text-foreground sm:text-4xl"
            >
              {name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              {description}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 border-2 border-border bg-background/60 px-2 py-2">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              <div>
                <dt className="sr-only">Players</dt>
                <dd className="font-bold text-foreground">
                  {minPlayers}–{maxPlayers} players
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-1.5 border-2 border-border bg-background/60 px-2 py-2">
              <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
              <div>
                <dt className="sr-only">Rating</dt>
                <dd className="font-bold text-foreground">
                  <RatingDisplay rating={rating} ratingCount={ratingCount} />
                </dd>
              </div>
            </div>
          </dl>
          <p className="text-xs text-muted">
            Created by <span className="font-bold text-foreground">{createdBy}</span>
          </p>
          <Link to={route} className="mt-1">
            <Button size="lg" fullWidth className="text-lg">
              Play
            </Button>
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article
      className="group glass-panel brutal-shadow-sm relative flex flex-col gap-3 border-2 border-border p-4 transition-all duration-200 hover:-translate-y-1 hover:border-foreground active:scale-[0.99] sm:p-5"
      style={shadowStyle}
      aria-labelledby={`game-card-${id}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden>{icon}</span>
        <div className="min-w-0 flex-1">
          <h3
            id={`game-card-${id}`}
            className="font-display text-xl font-black uppercase leading-tight"
          >
            {name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{category}</Badge>
        <span className="text-xs font-bold text-muted">
          {minPlayers}–{maxPlayers} ·{' '}
          <RatingDisplay rating={rating} ratingCount={ratingCount} compact />
        </span>
      </div>
      <Link to={route} className="mt-auto">
        <Button variant="secondary" size="md" fullWidth>
          Play
        </Button>
      </Link>
    </article>
  )
}
