import { useEffect, useState } from 'react'
import { fetchAdminDashboardStats } from '../../services/admin'

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalRatings: 0,
    averageRating: null as number | null,
    pendingIdeas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminDashboardStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  const cards = [
    { label: 'Total games', value: stats.totalGames },
    { label: 'Total ratings', value: stats.totalRatings },
    {
      label: 'Average rating',
      value: stats.averageRating ?? '—',
    },
    { label: 'Pending ideas', value: stats.pendingIdeas },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-black uppercase">Dashboard</h2>
      {loading ? <p className="mt-4 text-sm text-muted">Loading...</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border-2 border-border bg-surface p-4 brutal-shadow-sm"
          >
            <p className="text-xs font-bold uppercase text-muted">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-black">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
