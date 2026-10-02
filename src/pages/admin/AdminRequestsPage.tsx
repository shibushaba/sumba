import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGameRequests } from '../../services/gameRequests'
import type { GameRequestStatus } from '../../types/database'

const filters: Array<{ id: GameRequestStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'planned', label: 'Planned' },
  { id: 'building', label: 'Building' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
]

export function AdminRequestsPage() {
  const [filter, setFilter] = useState<GameRequestStatus | 'all'>('all')
  const [requests, setRequests] = useState<
    Awaited<ReturnType<typeof fetchGameRequests>>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchGameRequests(filter).then((data) => {
      setRequests(data)
      setLoading(false)
    })
  }, [filter])

  return (
    <div>
      <h2 className="font-display text-2xl font-black uppercase">Game ideas</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={[
              'border-2 px-2 py-1 text-[10px] font-bold uppercase',
              filter === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>
      {loading ? <p className="mt-4 text-sm text-muted">Loading game ideas...</p> : null}
      <ul className="mt-6 space-y-4">
        {requests.map((request) => (
          <li key={request.id} className="border-2 border-border bg-surface p-4">
            <p className="font-display text-lg font-black uppercase">
              {request.title || 'Untitled idea'}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{request.description}</p>
            <p className="mt-3 text-xs uppercase text-muted">
              Status: {request.status}
            </p>
            <Link
              to={`/admin/requests/${request.id}`}
              className="mt-3 inline-block text-xs font-bold uppercase text-primary underline-offset-4 hover:underline"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
