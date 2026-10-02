import { useEffect, useState } from 'react'
import { fetchAdminRatings } from '../../services/admin'

export function AdminRatingsPage() {
  const [filter, setFilter] = useState<number | undefined>(undefined)
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchAdminRatings>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchAdminRatings(filter).then((data) => {
      setRows(data)
      setLoading(false)
    })
  }, [filter])

  const filters = [
    { label: 'All', value: undefined },
    { label: '5 stars', value: 5 },
    { label: '4 stars', value: 4 },
    { label: '3 stars', value: 3 },
    { label: '2 stars', value: 2 },
    { label: '1 star', value: 1 },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-black uppercase">Ratings</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setFilter(item.value)}
            className={[
              'border-2 px-2 py-1 text-[10px] font-bold uppercase',
              filter === item.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>
      {loading ? <p className="mt-4 text-sm text-muted">Loading ratings...</p> : null}
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="border-2 border-border bg-surface p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-bold">{row.game_name}</span>
              <span>{'★'.repeat(row.rating)}</span>
            </div>
            {row.feedback ? (
              <p className="mt-2 text-muted">{row.feedback}</p>
            ) : null}
            <p className="mt-2 text-xs text-muted">
              {new Date(row.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
