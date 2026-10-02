import { Link } from 'react-router-dom'
import { FullscreenMessageLayout } from '../components/layout/FullscreenMessageLayout'
import { Button } from '../components/ui/Button'

interface GameComingSoonPageProps {
  name?: string
  embedded?: boolean
}

function ComingSoonContent({ name }: { name?: string }) {
  return (
    <>
      <h1 className="font-display text-3xl font-black uppercase">Coming soon</h1>
      {name ? (
        <p className="mt-2 font-display text-xl font-black uppercase text-primary">{name}</p>
      ) : null}
      <p className="mt-3 max-w-sm text-sm text-muted">
        This game is being prepared for SUMBA.
      </p>
      <Link to="/games" className="mt-8">
        <Button variant="secondary">Back to games</Button>
      </Link>
    </>
  )
}

export function GameComingSoonPage({ name, embedded = false }: GameComingSoonPageProps) {
  if (embedded) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
        <ComingSoonContent name={name} />
      </div>
    )
  }

  return (
    <FullscreenMessageLayout>
      <ComingSoonContent name={name} />
    </FullscreenMessageLayout>
  )
}
