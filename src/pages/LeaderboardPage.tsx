import { useParams } from 'react-router-dom'
import {
  LeaderboardPanel,
  type LeaderboardGameTab,
} from '../components/leaderboard/LeaderboardPanel'
import { AnimatedPage } from '../components/motion/AnimatedPage'
import { usePlayerAuthOptional } from '../components/auth/PlayerAuthProvider'
import { useState, useEffect } from 'react'

export function LeaderboardPage() {
  const { gameSlug } = useParams()
  const auth = usePlayerAuthOptional()
  const initial: LeaderboardGameTab =
    gameSlug && gameSlug !== 'overall' ? gameSlug : 'overall'
  const [tab, setTab] = useState<LeaderboardGameTab>(initial)

  useEffect(() => {
    if (gameSlug) setTab(gameSlug)
  }, [gameSlug])

  const tabTitle =
    tab === 'overall'
      ? 'All games'
      : tab === 'imposter'
        ? 'Imposter'
        : tab === 'mafia'
          ? 'Mafia'
          : tab.replace(/-/g, ' ')

  return (
    <AnimatedPage className="flex flex-col gap-5 pb-2">
      <header className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
              Rankings
            </p>
            <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-wide">
              Leaderboard
            </h1>
            <p className="text-sm text-muted">
              {auth?.user
                ? `${tabTitle} · your player group`
                : 'Sign in to track scores'}
            </p>
          </div>
          {auth?.user ? (
            <div
              className="flex items-center gap-2 rounded-full border border-[var(--smb-border)] bg-black/25 px-2.5 py-1.5"
              title="Scores update when games finish"
            >
              <span className="lb-live-dot" aria-hidden />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Live</span>
            </div>
          ) : null}
        </div>
      </header>

      <LeaderboardPanel
        gameTab={tab}
        onGameTabChange={setTab}
        showGameTabs
      />
    </AnimatedPage>
  )
}
