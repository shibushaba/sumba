import { useEffect, useMemo, useState } from 'react'
import { filterSavedPlayerSuggestions } from '../../lib/savedPlayerSearch'
import { isValidPlayerDisplayName, formatPlayerDisplayName } from '../../lib/playerName'
import { usePlayerAuthOptional } from '../auth/PlayerAuthProvider'
import { createLocalPartyPlayer } from '../../players/localPartyPlayer'
import {
  createSavedPlayer,
  fetchSavedPlayers,
} from '../../services/savedPlayers'
import { ensureSupabase } from '../../lib/supabase'
import type { SavedPlayerRecord, SelectedPlayer } from '../../players/types'
import { GameButton } from '../games/imposter/GameButton'

interface PlayerSelectorProps {
  selected: readonly SelectedPlayer[]
  onSelect: (player: SelectedPlayer) => void
  maxPlayers?: number
  disabled?: boolean
}

export function PlayerSelector({
  selected,
  onSelect,
  maxPlayers,
  disabled,
}: PlayerSelectorProps) {
  const auth = usePlayerAuthOptional()
  const [roster, setRoster] = useState<SavedPlayerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void ensureSupabase()
      .then(() => fetchSavedPlayers())
      .then((list) => {
        if (!cancelled) {
          setRoster(list)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const excludeIds = useMemo(
    () => new Set(selected.map((p) => p.id)),
    [selected],
  )

  const suggestions = useMemo(
    () =>
      filterSavedPlayerSuggestions(roster, query, {
        excludeIds,
      }),
    [roster, query, excludeIds],
  )

  const atMax =
    maxPlayers !== undefined && selected.length >= maxPlayers

  async function handleCreate() {
    const name = formatPlayerDisplayName(query)
    if (!isValidPlayerDisplayName(name)) {
      setError('Enter a name (1–30 characters).')
      return
    }
    setCreating(true)
    setError(null)
    await ensureSupabase()

    const signedIn = Boolean(auth?.user)
    let player: SelectedPlayer | null = null

    if (signedIn) {
      player = await createSavedPlayer(name)
      setCreating(false)
      if (!player) {
        setError('Could not save player. Check your connection and try again.')
        return
      }
    } else {
      player = createLocalPartyPlayer(name)
      setCreating(false)
    }

    setRoster((prev) => {
      const exists = prev.some((p) => p.id === player!.id)
      if (exists) {
        return prev.map((p) =>
          p.id === player!.id
            ? { ...p, displayName: player!.displayName, isActive: true }
            : p,
        )
      }
      return [
        ...prev,
        {
          id: player!.id,
          displayName: player!.displayName,
          normalizedName: player!.displayName.toLowerCase(),
          avatarSeed: '',
          isActive: true,
          lastPlayedAt: null,
        },
      ]
    })
    onSelect(player)
    setQuery('')
  }

  function handlePick(player: SavedPlayerRecord) {
    if (atMax || disabled) return
    onSelect({ id: player.id, displayName: player.displayName })
    setQuery('')
    setError(null)
  }

  const showCreate =
    query.trim().length > 0 &&
    suggestions.length === 0 &&
    isValidPlayerDisplayName(query)

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold uppercase text-muted" htmlFor="add-player">
          Add player…
        </label>
        <input
          id="add-player"
          className="mt-1 w-full min-h-12 border-2 border-border bg-background px-3 py-3 font-bold uppercase"
          value={query}
          disabled={disabled || atMax}
          placeholder={atMax ? 'Player limit reached' : 'Type a name'}
          onChange={(e) => {
            setQuery(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (suggestions[0]) handlePick(suggestions[0])
              else if (showCreate) void handleCreate()
            }
          }}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading saved players…</p>
      ) : null}

      {suggestions.length > 0 ? (
        <ul className="border-2 border-border divide-y divide-border">
          {suggestions.slice(0, 8).map((player) => (
            <li key={player.id}>
              <button
                type="button"
                className="flex w-full min-h-12 items-center justify-between px-3 py-2 text-left font-display font-black uppercase hover:bg-surface/80"
                onClick={() => handlePick(player)}
                disabled={disabled || atMax}
              >
                <span>{player.displayName}</span>
                <span className="text-primary">+</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {query.trim() && !loading && suggestions.length === 0 ? (
        <p className="text-sm text-muted">
          {auth?.user
            ? 'No saved player found.'
            : 'No saved player found. You can still add a guest for this game.'}
        </p>
      ) : null}

      {showCreate ? (
        <GameButton
          variant="secondary"
          fullWidth
          disabled={creating || disabled || atMax}
          onClick={() => void handleCreate()}
        >
          + Add &quot;{formatPlayerDisplayName(query).toUpperCase()}&quot;
        </GameButton>
      ) : null}

      {error ? (
        <p className="text-sm font-bold text-primary" role="alert">{error}</p>
      ) : null}
    </div>
  )
}
