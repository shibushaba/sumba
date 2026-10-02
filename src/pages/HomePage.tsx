import { Link } from 'react-router-dom'
import { GameTile } from '../components/games/GameTile'
import { GlassButton } from '../components/ui/glass/GlassButton'
import { AnimatedPage } from '../components/motion/AnimatedPage'
import { AnimatedStagger } from '../components/motion/AnimatedStagger'
import { useGameCatalog } from '../hooks/useGameCatalog'
import { usePlayerAuthOptional } from '../components/auth/PlayerAuthProvider'
import { LetterMorphHeading } from '../motion/LetterMorphHeading'
import { toGameCardProps } from '../types/game'

export function HomePage() {
  const { games, featured, loading } = useGameCatalog()
  const auth = usePlayerAuthOptional()
  const firstName =
    auth?.profile?.displayName?.split(' ')[0] ??
    auth?.profile?.username ??
    null

  return (
    <AnimatedPage className="flex flex-col gap-5">
      <header className="space-y-1">
        {firstName ? (
          <AnimatedStagger index={0}>
            <p className="font-display text-xl font-semibold tracking-wide motion-slide-up">
              Hi {firstName}.
            </p>
          </AnimatedStagger>
        ) : null}
        <AnimatedStagger index={1}>
          <p className="text-sm text-muted motion-slide-up motion-stagger-1">
            Assalamualaikum.
          </p>
        </AnimatedStagger>
      </header>

      <section>
        <LetterMorphHeading
          text="WHAT ARE WE PLAYING?"
          className="font-display text-2xl font-bold uppercase leading-tight tracking-wide"
        />
      </section>

      {loading ? (
        <div className="h-44 animate-pulse rounded-[var(--radius-md)] bg-surface/30" />
      ) : null}

      {featured ? (
        <AnimatedStagger index={0}>
          <GameTile
            slug={featured.slug}
            name={featured.name}
            route={toGameCardProps(featured).route}
            featured
          />
        </AnimatedStagger>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Games
        </h2>
        <div className="flex flex-col gap-3">
          {games
            .filter((g) => g.slug !== featured?.slug)
            .map((g, index) => {
              const props = toGameCardProps(g)
              return (
                <AnimatedStagger key={g.slug} index={index + 1}>
                  <GameTile slug={g.slug} name={g.name} route={props.route} />
                </AnimatedStagger>
              )
            })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Link to="/leaderboard">
          <GlassButton variant="secondary" fullWidth>Leaderboard</GlassButton>
        </Link>
        <Link to="/suggest">
          <GlassButton variant="secondary" fullWidth>Suggest a game</GlassButton>
        </Link>
      </section>
    </AnimatedPage>
  )
}
