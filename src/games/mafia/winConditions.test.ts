import { describe, expect, it } from 'vitest'
import { assignRoles } from './assignRoles'
import {
  createInitialMafiaState,
  mafiaReducer,
  resolveCurrentRound,
} from './reducer'
import type { MafiaPlayer } from './types'

function basePlayers(): MafiaPlayer[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `p${i}`,
    name: `P${i}`,
    role: 'civilian' as const,
    alive: true,
  }))
}

describe('Mafia V2 win conditions', () => {
  it('ends immediately when Mafia kills Detective without protection', () => {
    const players = assignRoles(basePlayers())
    const detective = players.find((p) => p.role === 'detective')!
    const state = {
      ...createInitialMafiaState(),
      players,
      doctorPlayerId: players.find((p) => p.role === 'doctor')!.id,
      doctorAlive: true,
      doctorProtectionActive: false,
      doctorProtectedPlayerId: null,
      currentRound: 1 as const,
      round: {
        roundNumber: 1 as const,
        mafiaTargetId: detective.id,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    }

    const next = resolveCurrentRound(state)
    expect(next.phase).toBe('game-over')
    expect(next.winner).toBe('mafia')
    expect(next.winReason).toBe('detective-killed')
    expect(next.players.find((p) => p.id === detective.id)?.alive).toBe(false)
  })

  it('saves Detective when protected and game continues', () => {
    const players = assignRoles(basePlayers())
    const detective = players.find((p) => p.role === 'detective')!
    const state = {
      ...createInitialMafiaState(),
      players,
      doctorPlayerId: players.find((p) => p.role === 'doctor')!.id,
      doctorAlive: true,
      doctorProtectionActive: true,
      doctorProtectedPlayerId: detective.id,
      currentRound: 1 as const,
      round: {
        roundNumber: 1 as const,
        mafiaTargetId: detective.id,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    }

    const next = resolveCurrentRound(state)
    expect(next.phase).not.toBe('game-over')
    expect(next.players.find((p) => p.id === detective.id)?.alive).toBe(true)
    expect(next.doctorProtectionActive).toBe(false)
  })

  it('ends immediately when Detective finds Mafia', () => {
    const players = assignRoles(basePlayers())
    const mafia = players.find((p) => p.role === 'mafia')!
    const doctor = players.find((p) => p.role === 'doctor')!
    const detective = players.find((p) => p.role === 'detective')!

    const state = {
      ...createInitialMafiaState(),
      phase: 'round-action' as const,
      players,
      actionQueue: [mafia.id, doctor.id, detective.id],
      actionIndex: 2,
      actionStep: 'action' as const,
      currentRound: 1 as const,
      round: {
        roundNumber: 1 as const,
        mafiaTargetId: null,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    }

    const next = mafiaReducer(state, {
      type: 'DETECTIVE_INVESTIGATE',
      targetId: mafia.id,
    })
    expect(next.phase).toBe('game-over')
    expect(next.winner).toBe('detective')
    expect(next.winReason).toBe('detective-found')
  })

  it('mafia survives 3 rounds', () => {
    const state = {
      ...createInitialMafiaState(),
      phase: 'round-result' as const,
      currentRound: 3 as const,
      roundsCompleted: 3,
      winner: null,
      winReason: null,
      players: assignRoles(basePlayers()),
      round: {
        roundNumber: 3 as const,
        mafiaTargetId: null,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    }
    const next = mafiaReducer(state, { type: 'START_NEXT_ROUND' })
    expect(next.phase).toBe('game-over')
    expect(next.winner).toBe('mafia')
    expect(next.winReason).toBe('mafia-survived')
  })
})
