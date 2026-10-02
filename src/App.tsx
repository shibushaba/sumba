import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { PwaShell } from './components/pwa/PwaShell'
import { AdminAuthProvider } from './components/admin/AdminAuthProvider'
import { AdminGuard } from './components/admin/AdminGuard'
import { AdminLayout } from './components/admin/AdminLayout'
import { AppShell } from './components/layout/AppShell'
import { PlayerAuthProvider } from './components/auth/PlayerAuthProvider'
import { ToastProvider } from './context/ToastContext'
import { AboutPage } from './pages/AboutPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminGamesPage } from './pages/admin/AdminGamesPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminPacksPage } from './pages/admin/AdminPacksPage'
import { AdminRatingsPage } from './pages/admin/AdminRatingsPage'
import { AdminRequestDetailPage } from './pages/admin/AdminRequestDetailPage'
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage'
import { GameDetailsPage } from './pages/GameDetailsPage'
import { GamePlayPage } from './pages/GamePlayPage'
import { GamesPage } from './pages/GamesPage'
import { HomePage } from './pages/HomePage'
import { SuggestPage } from './pages/SuggestPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { SavedPlayersPage } from './pages/SavedPlayersPage'
import { SettingsPage } from './pages/SettingsPage'
import { MorePage } from './pages/MorePage'

function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  )
}

function PwaLayout() {
  return (
    <ToastProvider>
      <PwaShell>
        <Outlet />
      </PwaShell>
    </ToastProvider>
  )
}

function AppRoot() {
  return (
    <PlayerAuthProvider>
      <Outlet />
    </PlayerAuthProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <PwaLayout />,
    children: [
      { path: '/games/:gameSlug', element: <GamePlayPage /> },
      {
        element: <AppRoot />,
        children: [
          {
            element: <AppShell />,
            children: [
          { path: '/', element: <HomePage /> },
          { path: '/games', element: <GamesPage /> },
          { path: '/games/:gameSlug/details', element: <GameDetailsPage /> },
          { path: '/suggest', element: <SuggestPage /> },
          { path: '/about', element: <AboutPage /> },
          { path: '/leaderboard', element: <LeaderboardPage /> },
          { path: '/leaderboard/:gameSlug', element: <LeaderboardPage /> },
          { path: '/players', element: <SavedPlayersPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/more', element: <MorePage /> },
            ],
          },
        ],
      },
      {
        path: '/admin',
        element: <AdminRoot />,
        children: [
          { path: 'login', element: <AdminLoginPage /> },
          {
            element: <AdminGuard />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminDashboardPage /> },
                  { path: 'games', element: <AdminGamesPage /> },
                  { path: 'packs', element: <AdminPacksPage /> },
                  { path: 'requests', element: <AdminRequestsPage /> },
                  { path: 'requests/:id', element: <AdminRequestDetailPage /> },
                  { path: 'ratings', element: <AdminRatingsPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
