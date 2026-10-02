import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4 py-2">
      <Link
        to="/"
        className="font-display text-2xl font-black uppercase tracking-tight text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        aria-label="SUMBA home"
      >
        SUMBA
      </Link>
      <Link
        to="/about"
        className="flex items-center gap-1.5 border-2 border-border bg-surface/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted transition-colors hover:border-primary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
        Party mode
      </Link>
    </header>
  )
}
