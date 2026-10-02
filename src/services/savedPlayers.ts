import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { SavedPlayerRecord, SelectedPlayer } from '../players/types'

function mapRow(row: Record<string, unknown>): SavedPlayerRecord {
  return {
    id: row.id as string,
    displayName: row.display_name as string,
    normalizedName: row.normalized_name as string,
    avatarSeed: row.avatar_seed as string,
    isActive: row.is_active as boolean,
    lastPlayedAt: (row.last_played_at as string | null) ?? null,
  }
}

export async function fetchSavedPlayers(): Promise<SavedPlayerRecord[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('saved_players')
    .select(
      'id, display_name, normalized_name, avatar_seed, is_active, last_played_at',
    )
    .order('display_name', { ascending: true })

  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []).map(mapRow)
}

export async function createSavedPlayer(
  displayName: string,
): Promise<SelectedPlayer | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.rpc('create_saved_player', {
    p_display_name: displayName,
  })
  if (error || !data) {
    console.error(error)
    return null
  }
  const row = data as Record<string, unknown>
  return { id: row.id as string, displayName: row.display_name as string }
}

export async function renameSavedPlayer(
  playerId: string,
  displayName: string,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.rpc('rename_saved_player', {
    p_player_id: playerId,
    p_display_name: displayName,
  })
  if (error) console.error(error)
  return !error
}

export async function setSavedPlayerActive(
  playerId: string,
  active: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.rpc('set_saved_player_active', {
    p_player_id: playerId,
    p_active: active,
  })
  if (error) console.error(error)
  return !error
}

export async function linkSelfSavedPlayer(playerId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  const { error } = await supabase.rpc('link_self_saved_player', {
    p_player_id: playerId,
  })
  if (error) console.error(error)
  return !error
}

/** Ensures the signed-in owner has at least one saved player and a linked self profile. */
export async function ensureOwnerPlayerRoster(profile: {
  username: string
  displayName: string
}): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return

  const list = await fetchSavedPlayers()
  const selfId = await fetchSelfPlayerId()
  const norm = profile.username.trim().toLowerCase()

  if (list.length === 0) {
    const created = await createSavedPlayer(
      profile.displayName.trim() || profile.username.trim(),
    )
    if (created) {
      await linkSelfSavedPlayer(created.id)
    }
    return
  }

  if (selfId) return

  const match =
    list.find((p) => p.normalizedName === norm) ??
    list.find((p) => p.displayName.trim().toLowerCase() === norm) ??
    list[0]

  if (match) {
    await linkSelfSavedPlayer(match.id)
  }
}

export async function fetchSelfPlayerId(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return null
  const { data } = await supabase
    .from('profiles')
    .select('self_player_id')
    .eq('user_id', auth.user.id)
    .maybeSingle()
  return (data?.self_player_id as string | null) ?? null
}

export async function deleteSavedPlayerIfUnused(
  playerId: string,
): Promise<'deleted' | 'deactivated' | 'error'> {
  if (!isSupabaseConfigured || !supabase) return 'error'
  const { count, error: countError } = await supabase
    .from('player_score_events')
    .select('id', { count: 'exact', head: true })
    .eq('player_id', playerId)

  if (countError) {
    console.error(countError)
    return 'error'
  }

  if ((count ?? 0) > 0) {
    const ok = await setSavedPlayerActive(playerId, false)
    return ok ? 'deactivated' : 'error'
  }

  const { error } = await supabase
    .from('saved_players')
    .delete()
    .eq('id', playerId)

  if (error) {
    console.error(error)
    return 'error'
  }
  return 'deleted'
}
