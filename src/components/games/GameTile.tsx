import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { GameArtwork } from '../game-art/GameArtwork'
import type { ArtworkHandle } from '../game-art/ArtworkStage'
import { parseGameArtSlug } from '../game-art/types'
import { playFeedback } from '../../motion/feedback'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const TAGLINES: Record<string, string> = {
  imposter: 'Find the hidden Imposter.',
  mafia: 'Find the Mafia.',
  'who-where-what': 'Create unexpected sentences.',
}

/** Route transition begins at ~250ms so the artwork press beat can play. */
const PRESS_NAVIGATE_MS = 250

export interface GameTileProps {
  slug: string
  name: string
  route: string
  featured?: boolean
}

export function GameTile({ slug, name, route, featured = false }: GameTileProps) {
  const tagline = TAGLINES[slug]
  const game = parseGameArtSlug(slug)
  const navigate = useNavigate()
  const reduced = usePrefersReducedMotion()
  const artRef = useRef<ArtworkHandle>(null)
  const [pressing, setPressing] = useState(false)
  const navTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (navTimer.current !== null) window.clearTimeout(navTimer.current)
    },
    [],
  )

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    playFeedback({ haptic: 'light', sound: 'button_press' })
    // Let modified clicks / middle clicks behave like a normal link.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    if (reduced || navTimer.current !== null) return

    e.preventDefault()
    setPressing(true)
    artRef.current?.playPress()
    navTimer.current = window.setTimeout(() => {
      navTimer.current = null
      navigate(route)
    }, PRESS_NAVIGATE_MS)
  }

  return (
    <Link
      to={route}
      className="group block w-full touch-manipulation game-tile-enter"
      onClick={onClick}
    >
      <article
        className={[
          'game-tile',
          featured ? 'game-tile--featured' : '',
          pressing ? 'is-pressing' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={['game-art-stage', featured ? 'game-art-stage--featured' : ''].filter(Boolean).join(' ')}>
          {game ? <GameArtwork ref={artRef} game={game} /> : null}
        </div>
        <div className="game-tile__footer flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <h3 className="game-tile__title truncate font-display text-xl font-bold uppercase tracking-wide">
              {name}
            </h3>
            {tagline ? <p className="game-tile__tagline mt-0.5 truncate text-xs">{tagline}</p> : null}
          </div>
          <ChevronRight
            className="game-tile__chevron h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  )
}
