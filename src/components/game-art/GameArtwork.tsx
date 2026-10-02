import { forwardRef } from 'react'
import type { ArtworkHandle } from './ArtworkStage'
import { ImposterArtwork } from './ImposterArtwork'
import { MafiaArtwork } from './MafiaArtwork'
import { WhoWhereWhatArtwork } from './WhoWhereWhatArtwork'
import { parseGameArtSlug } from './types'

export interface GameArtworkProps {
  game: string
  className?: string
}

/** Routes a game slug to its SVG artwork. Returns null for unknown slugs. */
export const GameArtwork = forwardRef<ArtworkHandle, GameArtworkProps>(function GameArtwork(
  { game, className = '' },
  ref,
) {
  const id = parseGameArtSlug(game)
  if (!id) return null

  const art =
    id === 'imposter' ? (
      <ImposterArtwork ref={ref} />
    ) : id === 'mafia' ? (
      <MafiaArtwork ref={ref} />
    ) : (
      <WhoWhereWhatArtwork ref={ref} />
    )

  return <div className={['game-art-root', className].filter(Boolean).join(' ')}>{art}</div>
})
