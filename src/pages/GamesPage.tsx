import { GameTile } from '../components/games/GameTile'
import { AnimatedPage } from '../components/motion/AnimatedPage'
import { AnimatedStagger } from '../components/motion/AnimatedStagger'
import { useGameCatalog } from '../hooks/useGameCatalog'
import { toGameCardProps } from '../types/game'

export function GamesPage() {
  const { games, loading, error } = useGameCatalog()

  return (
    <AnimatedPage className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Games</h1>
      {loading ? (
        <div className="h-36 animate-pulse rounded-[var(--radius-md)] bg-surface/30" />
      ) : null}
      {error ? (
        <p className="text-sm text-primary" role="status">{error}</p>
      ) : null}
      <div className="flex flex-col gap-3">
        {games.map((game, index) => {
          const props = toGameCardProps(game)
          return (
            <AnimatedStagger key={game.slug} index={index}>
              <GameTile slug={game.slug} name={game.name} route={props.route} />
            </AnimatedStagger>
          )
        })}
      </div>
    </AnimatedPage>
  )
}
