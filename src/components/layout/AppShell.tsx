import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { SumbaBackground } from './SumbaBackground'
import { BottomNav } from './BottomNav'
import { BackButton } from '../ui/BackButton'

const MAIN_ROUTES = new Set(['/', '/games', '/leaderboard', '/more'])

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMain = MAIN_ROUTES.has(location.pathname)
  const showBack = !isMain

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/')
  }

  return (
    <div className="relative min-h-dvh text-foreground">
      <SumbaBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 pb-nav pt-safe">
        {showBack ? (
          <div className="shrink-0 pb-1">
            <BackButton onClick={handleBack} />
          </div>
        ) : (
          <div className="shrink-0 py-2">
            <span className="font-display text-lg font-bold uppercase tracking-[0.25em]">
              Sumba
            </span>
          </div>
        )}
        <main className="flex flex-1 flex-col py-4">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
