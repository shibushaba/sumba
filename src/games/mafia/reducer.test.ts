import { describe, expect, it } from 'vitest'
import { assignRoles } from './assignRoles'
import { buildRoundActionQueue } from './actionQueue'
import {
  createInitialMafiaState,
  mafiaReducer,
} from './reducer'
import type { MafiaPlayer } from './types'

function withPlayers(count: number): MafiaPlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    name: `P${i}`,
    role: 'civilian' as const,
    alive: true,
  }))
}

describe('mafiaReducer gameplay', () => {
  it('detective finding mafia ends game immediately', () => {
    let state = createInitialMafiaState()
    state = {
      ...state,
      phase: 'players',
      players: withPlayers(5),
    }
    state = assignRolesToState(state)
    const mafia = state.players.find((p) => p.role === 'mafia')!
    const detective = state.players.find((p) => p.role === 'detective')!

    state = {
      ...state,
      phase: 'round-action',
      actionQueue: [mafia.id, detective.id],
      actionIndex: 1,
      actionStep: 'action',
      currentRound: 1,
      round: {
        roundNumber: 1,
        mafiaTargetId: null,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    }

    state = mafiaReducer(state, {
      type: 'DETECTIVE_INVESTIGATE',
      targetId: mafia.id,
    })
    expect(state.phase).toBe('game-over')
    expect(state.winner).toBe('detective')
    expect(state.winReason).toBe('detective-found')
  })

  it('mafia wins after round 3 without detective catch', () => {
    let state = createInitialMafiaState()
    state = {
      ...state,
      phase: 'round-result',
      currentRound: 3,
      roundsCompleted: 3,
      winner: null,
      players: assignRoles(withPlayers(5)),
      round: {
        roundNumber: 3,
        mafiaTargetId: null,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    }
    state = mafiaReducer(state, { type: 'START_NEXT_ROUND' })
    expect(state.phase).toBe('game-over')
    expect(state.winner).toBe('mafia')
  })

  it('dead players are not in living target lists via actionQueue', () => {
    const players = assignRoles(withPlayers(5))
    const victim = players[0]
    const dead = { ...victim, alive: false }
    const updated = players.map((p) => (p.id === victim.id ? dead : p))
    const queue = buildRoundActionQueue(updated, false)
    expect(queue).not.toContain(victim.id)
  })
})

function assignRolesToState(state: ReturnType<typeof createInitialMafiaState>) {
  const players = assignRoles(state.players.map((p) => ({ id: p.id, name: p.name })))
  return { ...state, players, rolesAssigned: true }
}

describe('scoring idempotency flag', () => {
  it('marks score submitted once', () => {
    let state = createInitialMafiaState()
    state = mafiaReducer(state, { type: 'MARK_SCORE_SUBMITTED' })
    expect(state.scoreSubmitted).toBe(true)
    state = mafiaReducer(state, { type: 'MARK_SCORE_SUBMITTED' })
    expect(state.scoreSubmitted).toBe(true)
  })
})
