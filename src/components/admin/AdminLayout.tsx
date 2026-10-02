import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthProvider'
import { Button } from '../ui/Button'
import { BackButton } from '../ui/BackButton'

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/games', label: 'Games' },
  { to: '/admin/packs', label: 'Packs' },
  { to: '/admin/requests', label: 'Game ideas' },
  { to: '/admin/ratings', label: 'Ratings' },
]

export function AdminLayout() {
  const { signOut } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const showBack = location.pathname !== '/admin'

  async function handleLogout() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="relative min-h-dvh text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 py-6">
        {showBack ? (
          <BackButton
            className="mb-4"
            onClick={() => navigate('/admin')}
            label="Admin home"
          />
        ) : null}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 border-border pb-4">
          <div>
            <p className="font-display text-2xl font-black uppercase">Sumba admin</p>
            <p className="text-xs text-muted">Internal tools</p>
          </div>
          <Button variant="secondary" size="md" onClick={handleLogout}>
            Log out
          </Button>
        </header>
        <nav className="mb-8 flex flex-wrap gap-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'border-2 px-3 py-2 text-xs font-bold uppercase tracking-wide',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-muted hover:border-foreground',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="mt-10 text-center text-xs text-muted">
          <Link to="/" className="underline-offset-4 hover:underline">
            Back to SUMBA
          </Link>
        </footer>
      </div>
    </div>
  )
}
