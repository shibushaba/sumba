import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t-2 border-border pt-8 pb-6 text-center">
      <p className="font-display text-xl font-black uppercase">SUMBA</p>
      <p className="mt-1 text-sm text-muted">Made for game nights.</p>
      <nav className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-bold uppercase">
        <Link to="/leaderboard" className="text-primary underline-offset-2 hover:underline">
          Leaderboard
        </Link>
        <Link to="/players" className="text-muted underline-offset-2 hover:underline">
          Saved players
        </Link>
      </nav>
    </footer>
  )
}
