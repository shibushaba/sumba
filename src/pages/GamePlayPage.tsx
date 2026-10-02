import { Suspense, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import { loadGame } from '../game-engine/core/loadGame'
import { resolveGameBySlug } from '../services/gameCatalog'
import type { ResolvedGame } from '../game-engine/core/types'
import { GameComingSoonPage } from './GameComingSoonPage'
import { GameNotFoundPage } from './GameNotFoundPage'

export function GamePlayPage() {
  const navigate = useNavigate()
  const { gameSlug = '' } = useParams()
  const [resolved, setResolved] = useState<ResolvedGame | null | undefined>(
    undefined,
  )

  useEffect(() => {
    let cancelled = false
    resolveGameBySlug(gameSlug).then((result) => {
      if (!cancelled) setResolved(result)
    })
    return () => {
      cancelled = true
    }
  }, [gameSlug])

  if (resolved === undefined) {
    return (
      <div className="flex min-h-dvh flex-col px-4 pt-safe pb-safe">
        <BackButton onClick={() => navigate('/games')} />
        <div className="flex flex-1 items-center justify-center text-sm text-muted">
          Loading game...
        </div>
      </div>
    )
  }

  if (!resolved) {
    return <GameNotFoundPage />
  }

  if (resolved.availability === 'coming_soon') {
    return <GameComingSoonPage name={resolved.metadata.name} />
  }

  if (resolved.availability !== 'playable') {
    return <GameNotFoundPage />
  }

  const loaded = loadGame(gameSlug)
  if (!loaded) {
    return <GameComingSoonPage name={resolved.metadata.name} />
  }

  const Play = loaded.definition.Play

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col px-4 pt-safe pb-safe">
          <BackButton onClick={() => navigate('/games')} />
          <div className="flex flex-1 items-center justify-center text-sm text-muted">
            Loading game...
          </div>
        </div>
      }
    >
      <Play />
    </Suspense>
  )
}
