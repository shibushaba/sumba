import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { fetchAdminRequestById } from '../../services/admin'
import {
  getSignedVoiceUrl,
  updateGameRequestStatus,
} from '../../services/gameRequests'
import type { GameRequestRow, GameRequestStatus } from '../../types/database'

const statuses: GameRequestStatus[] = [
  'pending',
  'reviewing',
  'planned',
  'building',
  'completed',
  'rejected',
]

export function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [request, setRequest] = useState<GameRequestRow | null>(null)
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchAdminRequestById(id).then((row) => {
      setRequest(row)
      setLoading(false)
    })
  }, [id])

  async function handlePlayVoice() {
    if (!request?.voice_path) return
    const url = await getSignedVoiceUrl(request.voice_path)
    if (!url) return
    setVoiceUrl(url)
    const audio = new Audio(url)
    audio.play().catch(() => undefined)
  }

  async function changeStatus(status: GameRequestStatus) {
    if (!request) return
    const result = await updateGameRequestStatus(request.id, status)
    if (result.ok) setRequest({ ...request, status })
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading...</p>
  }

  if (!request) {
    return <p className="text-sm text-primary">Request not found.</p>
  }

  return (
    <div>
      <Link to="/admin/requests" className="text-xs font-bold uppercase text-muted">
        ← Back to ideas
      </Link>
      <h2 className="mt-4 font-display text-2xl font-black uppercase">
        {request.title || 'Untitled idea'}
      </h2>
      <p className="mt-2 text-xs text-muted">
        Submitted {new Date(request.created_at).toLocaleString()}
      </p>
      <p className="mt-6 whitespace-pre-wrap text-sm">{request.description}</p>
      {request.voice_path ? (
        <Button className="mt-6" variant="secondary" onClick={handlePlayVoice}>
          Play voice
        </Button>
      ) : null}
      {voiceUrl ? (
        <audio className="mt-4 w-full" controls src={voiceUrl}>
          <track kind="captions" />
        </audio>
      ) : null}
      <div className="mt-8">
        <p className="text-xs font-bold uppercase text-muted">Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              size="md"
              variant={request.status === status ? 'primary' : 'secondary'}
              onClick={() => changeStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
