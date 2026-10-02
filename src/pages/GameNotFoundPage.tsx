import { Link } from 'react-router-dom'
import { FullscreenMessageLayout } from '../components/layout/FullscreenMessageLayout'
import { Button } from '../components/ui/Button'

interface GameNotFoundPageProps {
  embedded?: boolean
}

function GameNotFoundContent() {
  return (
    <>
      <h1 className="font-display text-3xl font-black uppercase">Game not found</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        Looks like this chaos hasn&apos;t been built yet.
      </p>
      <Link to="/games" className="mt-8">
        <Button variant="secondary">Back to games</Button>
      </Link>
    </>
  )
}

export function GameNotFoundPage({ embedded = false }: GameNotFoundPageProps) {
  if (embedded) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
        <GameNotFoundContent />
      </div>
    )
  }

  return (
    <FullscreenMessageLayout>
      <GameNotFoundContent />
    </FullscreenMessageLayout>
  )
}
