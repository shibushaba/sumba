import { useCallback, useEffect, useState } from 'react'
import { usePlayerAuth } from '../components/auth/PlayerAuthProvider'
import { PlayerLoginForm } from '../components/auth/PlayerLoginForm'
import {
  deleteSavedPlayerIfUnused,
  fetchSavedPlayers,
  linkSelfSavedPlayer,
  renameSavedPlayer,
  setSavedPlayerActive,
} from '../services/savedPlayers'
import type { SavedPlayerRecord } from '../players/types'
import { fetchOwnerLeaderboard } from '../services/leaderboard'
import { AnimatedPage } from '../components/motion/AnimatedPage'

export function SavedPlayersPage() {
  const { user, loading: authLoading } = usePlayerAuth()
  const [players, setPlayers] = useState<SavedPlayerRecord[]>([])
  const [query, setQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [statsById, setStatsById] = useState<Map<string, number>>(new Map())

  const reload = useCallback(async () => {
    const list = await fetchSavedPlayers()
    setPlayers(list)
    const overall = await fetchOwnerLeaderboard(null, 'all_time')
    const map = new Map<string, number>()
    if (!overall.ok) return
    for (const row of overall.rows) map.set(row.playerId, row.totalPoints)
    setStatsById(map)
  }, [])

  useEffect(() => {
    if (!user) return
    void reload()
  }, [user, reload])

  if (!authLoading && !user) {
    return (
      <AnimatedPage className="space-y-4">
        <h1 className="font-display text-2xl font-black uppercase">Saved players</h1>
        <p className="text-sm text-muted">Sign in to manage your player group.</p>
        <PlayerLoginForm />
      </AnimatedPage>
    )
  }

  const filtered = players.filter((p) => {
    if (!showInactive && !p.isActive) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return p.normalizedName.includes(q)
  })

  return (
    <AnimatedPage className="space-y-6">
      <h1 className="font-display text-2xl font-black uppercase">Saved players</h1>
      <p className="text-sm text-muted">
        Cousins and friends you play with — remembered across games.
      </p>
      <input
        className="w-full border-2 border-border bg-background px-3 py-3 font-bold uppercase"
        placeholder="Search players"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <label className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
        />
        Show inactive
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          No players yet. Add them when you start a game.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((player) => (
            <SavedPlayerRow
              key={player.id}
              player={player}
              points={statsById.get(player.id) ?? 0}
              onChanged={reload}
            />
          ))}
        </ul>
      )}
    </AnimatedPage>
  )
}

function SavedPlayerRow({
  player,
  points,
  onChanged,
}: {
  player: SavedPlayerRecord
  points: number
  onChanged: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.displayName)

  async function saveRename() {
    const ok = await renameSavedPlayer(player.id, name)
    if (ok) {
      setEditing(false)
      onChanged()
    }
  }

  return (
    <li className="border-2 border-border px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          {editing ? (
            <input
              className="w-full border-2 border-border px-2 py-1 font-bold uppercase"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <p className="font-display text-lg font-black uppercase">
              {player.displayName}
              {!player.isActive ? (
                <span className="ml-2 text-xs text-muted">(inactive)</span>
              ) : null}
            </p>
          )}
          <p className="text-xs text-muted">⭐ {points} all-time pts</p>
        </div>
        <div className="flex flex-col gap-1">
          {editing ? (
            <button
              type="button"
              className="text-xs font-bold uppercase text-primary"
              onClick={() => void saveRename()}
            >
              Save
            </button>
          ) : (
            <button
              type="button"
              className="text-xs font-bold uppercase text-muted"
              onClick={() => setEditing(true)}
            >
              Rename
            </button>
          )}
          <button
            type="button"
            className="text-xs font-bold uppercase text-muted"
            onClick={() => void linkSelfSavedPlayer(player.id).then(onChanged)}
          >
            This is me
          </button>
          {player.isActive ? (
            <button
              type="button"
              className="text-xs font-bold uppercase text-muted"
              onClick={() =>
                void setSavedPlayerActive(player.id, false).then(onChanged)
              }
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              className="text-xs font-bold uppercase text-primary"
              onClick={() =>
                void setSavedPlayerActive(player.id, true).then(onChanged)
              }
            >
              Reactivate
            </button>
          )}
          <button
            type="button"
            className="text-xs font-bold uppercase text-primary"
            onClick={() => void deleteSavedPlayerIfUnused(player.id).then(onChanged)}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
