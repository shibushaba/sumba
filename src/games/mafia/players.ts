import { MAX_PLAYERS, MIN_PLAYERS } from './constants'
import type { SelectedPlayer } from '../../players/types'
import type { MafiaGameState, MafiaPlayer } from './types'

export interface PlayerMutationResult {
  state: MafiaGameState
  error?: string
}

function normalizeName(raw: string): string {
  return raw.trim()
}

export function canStartMafia(state: MafiaGameState): boolean {
  return (
    state.players.length >= MIN_PLAYERS && state.players.length <= MAX_PLAYERS
  )
}

export function tryAddPlayer(
  state: MafiaGameState,
  selected: SelectedPlayer,
): PlayerMutationResult {
  if (state.phase !== 'setup' && state.phase !== 'players') {
    return { state, error: 'Cannot add players during a round.' }
  }
  const name = normalizeName(selected.displayName)
  if (!name) return { state, error: 'Enter a player name.' }
  const exists = state.players.some((p) => p.id === selected.id)
  if (exists) return { state, error: 'That player is already in this game.' }
  if (state.players.length >= MAX_PLAYERS) {
    return { state, error: `Maximum ${MAX_PLAYERS} players.` }
  }
  const player: MafiaPlayer = {
    id: selected.id,
    name: selected.displayName,
    role: 'civilian',
    alive: true,
  }
  return { state: { ...state, players: [...state.players, player] } }
}

export function tryRemovePlayer(
  state: MafiaGameState,
  index: number,
): PlayerMutationResult {
  if (state.phase !== 'setup' && state.phase !== 'players') {
    return { state, error: 'Cannot remove players during a round.' }
  }
  if (index < 0 || index >= state.players.length) {
    return { state, error: 'Invalid player.' }
  }
  return {
    state: { ...state, players: state.players.filter((_, i) => i !== index) },
  }
}

export function tryUpdatePlayerName(
  state: MafiaGameState,
  index: number,
  rawName: string,
): PlayerMutationResult {
  if (state.phase !== 'setup' && state.phase !== 'players') {
    return { state, error: 'Cannot edit names during a round.' }
  }
  const name = normalizeName(rawName)
  if (!name) return { state, error: 'Enter a player name.' }
  const duplicate = state.players.some(
    (p, i) => i !== index && p.name.toLowerCase() === name.toLowerCase(),
  )
  if (duplicate) return { state, error: 'That name is already in this game.' }
  const players = state.players.map((p, i) =>
    i === index ? { ...p, name } : p,
  )
  return { state: { ...state, players } }
}
