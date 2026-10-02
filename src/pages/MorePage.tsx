import { Link } from 'react-router-dom'
import { ChevronRight, Lightbulb, Settings, Users, Info } from 'lucide-react'
import { GlassPanel } from '../components/ui/glass/GlassPanel'
import { AnimatedPage } from '../components/motion/AnimatedPage'

const links = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/players', label: 'Saved players', icon: Users },
  { to: '/suggest', label: 'Suggest a game', icon: Lightbulb },
  { to: '/about', label: 'About', icon: Info },
]

export function MorePage() {
  return (
    <AnimatedPage className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold uppercase">More</h1>
      <ul className="flex flex-col gap-2">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to}>
              <GlassPanel
                padding="sm"
                className="flex min-h-[52px] items-center justify-between border border-[var(--smb-border-strong)]"
              >
                <span className="flex items-center gap-3 font-display text-xs font-bold uppercase tracking-wide">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
              </GlassPanel>
            </Link>
          </li>
        ))}
      </ul>
    </AnimatedPage>
  )
}
