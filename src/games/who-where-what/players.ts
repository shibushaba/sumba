import type { SelectedPlayer } from '../../players/types'
import { MAX_PLAYERS, MIN_PLAYERS } from './constants'
import type { WhoWhereWhatState } from './types'

export interface PlayerMutationResult {
  state: WhoWhereWhatState
  error?: string
}

function normalizeName(raw: string): string {
  return raw.trim()
}

export function tryAddPlayer(
  state: WhoWhereWhatState,
  selected: SelectedPlayer,
): PlayerMutationResult {
  const name = normalizeName(selected.displayName)
  if (!name) {
    return { state, error: 'Enter a player name.' }
  }
  const exists = state.players.some((p) => p.id === selected.id)
  if (exists) {
    return { state, error: 'That player is already in this game.' }
  }
  if (state.players.length >= MAX_PLAYERS) {
    return { state, error: `Maximum ${MAX_PLAYERS} players.` }
  }
  return {
    state: {
      ...state,
      players: [
        ...state.players,
        { id: selected.id, name: selected.displayName },
      ],
    },
  }
}

export function tryRemovePlayer(
  state: WhoWhereWhatState,
  index: number,
): PlayerMutationResult {
  if (state.phase !== 'players') {
    return { state, error: 'Cannot remove players during a round.' }
  }
  if (index < 0 || index >= state.players.length) {
    return { state, error: 'Invalid player.' }
  }
  const players = state.players.filter((_, i) => i !== index)
  return { state: { ...state, players } }
}

export function tryUpdatePlayerName(
  state: WhoWhereWhatState,
  index: number,
  rawName: string,
): PlayerMutationResult {
  if (state.phase !== 'players') {
    return { state, error: 'Cannot edit names during a round.' }
  }
  const name = normalizeName(rawName)
  if (!name) {
    return { state, error: 'Enter a player name.' }
  }
  const duplicate = state.players.some(
    (p, i) => i !== index && p.name.toLowerCase() === name.toLowerCase(),
  )
  if (duplicate) {
    return { state, error: 'That name is already in this game.' }
  }
  const players = state.players.map((p, i) =>
    i === index ? { ...p, name } : p,
  )
  return { state: { ...state, players } }
}

export function canStartWriting(state: WhoWhereWhatState): boolean {
  return state.players.length >= MIN_PLAYERS && state.players.length <= MAX_PLAYERS
}
