import { Home, LayoutGrid, Trophy, MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/games', label: 'Games', icon: LayoutGrid },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/more', label: 'More', icon: MoreHorizontal },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--smb-border)] bg-[rgba(5,5,5,0.94)] backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex min-h-[var(--nav-height)] flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 text-[10px] font-bold uppercase tracking-wide',
                  isActive ? 'text-[var(--smb-text)]' : 'text-[var(--smb-text-muted)]',
                ].join(' ')
              }
            >
              <>
                <Icon className="h-5 w-5" aria-hidden strokeWidth={2.25} />
                <span>{label}</span>
              </>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
