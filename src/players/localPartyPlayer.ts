import { formatPlayerDisplayName } from '../lib/playerName'
import type { SelectedPlayer } from './types'

const LOCAL_PREFIX = 'local-'

export function isLocalPartyPlayerId(id: string): boolean {
  return id.startsWith(LOCAL_PREFIX)
}

/** Guest player for this device session — not stored in Supabase. */
export function createLocalPartyPlayer(displayName: string): SelectedPlayer {
  const name = formatPlayerDisplayName(displayName)
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `${LOCAL_PREFIX}${crypto.randomUUID()}`
      : `${LOCAL_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`
  return { id, displayName: name }
}
