import { describe, expect, it } from 'vitest'
import { buildRoundActionQueue } from './actionQueue'
import { canDoctorAct, doctorProtectionForNewRound } from './doctorState'
import {
  createInitialMafiaState,
  mafiaReducer,
  resolveCurrentRound,
} from './reducer'
import type { MafiaPlayer } from './types'

const IDS = {
  mafia: 'mafia',
  doctor: 'doctor',
  detective: 'detective',
  c: 'civilian-c',
  d: 'civilian-d',
}

function basePlayers(): MafiaPlayer[] {
  return [
    { id: IDS.mafia, name: 'Mafia', role: 'mafia', alive: true },
    { id: IDS.doctor, name: 'Doctor', role: 'doctor', alive: true },
    { id: IDS.detective, name: 'Detective', role: 'detective', alive: true },
    { id: IDS.c, name: 'Shibu', role: 'civilian', alive: true },
    { id: IDS.d, name: 'Other', role: 'civilian', alive: true },
  ]
}

function stateWithNight(mafiaTarget: string) {
  return {
    ...createInitialMafiaState(),
    phase: 'round-action' as const,
    players: basePlayers(),
    doctorPlayerId: IDS.doctor,
    doctorAlive: true,
    doctorProtectedPlayerId: IDS.c,
    doctorProtectionActive: true,
    currentRound: 1 as const,
    round: {
      roundNumber: 1 as const,
      mafiaTargetId: mafiaTarget,
      detectiveTargetId: null,
      detectiveFoundMafia: false,
      eliminatedPlayerId: null,
      savedPlayerId: null,
    },
  }
}

describe('Mafia kills Doctor', () => {
  it('keeps protection on another player when Doctor dies', () => {
    let state = resolveCurrentRound(stateWithNight(IDS.doctor))

    const doctor = state.players.find((p) => p.id === IDS.doctor)
    const shibu = state.players.find((p) => p.id === IDS.c)

    expect(doctor?.alive).toBe(false)
    expect(state.doctorAlive).toBe(false)
    expect(shibu?.alive).toBe(true)
    expect(state.doctorProtectionActive).toBe(true)
    expect(state.doctorProtectedPlayerId).toBe(IDS.c)
    expect(canDoctorAct(state)).toBe(false)

    const queue = buildRoundActionQueue(state.players, state.doctorAlive)
    expect(queue).not.toContain(IDS.doctor)

    state = resolveCurrentRound({
      ...state,
      currentRound: 2,
      round: {
        roundNumber: 2,
        mafiaTargetId: IDS.c,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    })

    expect(state.players.find((p) => p.id === IDS.c)?.alive).toBe(true)
    expect(state.doctorProtectionActive).toBe(false)
    expect(state.doctorProtectedPlayerId).toBe(null)
    expect(state.doctorAlive).toBe(false)
    expect(buildRoundActionQueue(state.players, state.doctorAlive)).not.toContain(
      IDS.doctor,
    )
  })
})

describe('Doctor self-protect', () => {
  it('rejects protecting the Doctor role player', () => {
    let state = {
      ...createInitialMafiaState(),
      phase: 'round-action' as const,
      players: basePlayers(),
      doctorPlayerId: IDS.doctor,
      doctorAlive: true,
      actionStep: 'action' as const,
      actionIndex: 1,
      actionQueue: buildRoundActionQueue(basePlayers(), true),
    }

    state = mafiaReducer(state, {
      type: 'DOCTOR_PROTECT',
      targetId: IDS.doctor,
    })

    expect(state.doctorProtectionActive).toBe(false)
    expect(state.doctorProtectedPlayerId).toBe(null)
    expect(state.actionStep).toBe('action')
  })
})

describe('Doctor protection between rounds', () => {
  it('clears unused protection when Doctor is alive for a new round', () => {
    const state = {
      ...createInitialMafiaState(),
      doctorAlive: true,
      doctorProtectionActive: true,
      doctorProtectedPlayerId: IDS.c,
    }
    expect(doctorProtectionForNewRound(state)).toEqual({
      doctorProtectedPlayerId: null,
      doctorProtectionActive: false,
    })
  })

  it('starts round 2 without carrying over a living Doctor shield', () => {
    let state = resolveCurrentRound(stateWithNight(IDS.d))
    expect(state.doctorProtectionActive).toBe(true)

    state = {
      ...state,
      phase: 'round-result',
      currentRound: 1,
      winner: null,
    }
    state = mafiaReducer(state, { type: 'START_NEXT_ROUND' })

    expect(state.currentRound).toBe(2)
    expect(state.doctorAlive).toBe(true)
    expect(state.doctorProtectionActive).toBe(false)
    expect(state.doctorProtectedPlayerId).toBe(null)
  })
})

describe('Mafia kills Doctor without active protection', () => {
  it('leaves no protection and skips Doctor in future rounds', () => {
    const initial = {
      ...createInitialMafiaState(),
      players: basePlayers(),
      doctorPlayerId: IDS.doctor,
      doctorAlive: true,
      doctorProtectedPlayerId: null,
      doctorProtectionActive: false,
      currentRound: 1 as const,
      round: {
        roundNumber: 1 as const,
        mafiaTargetId: IDS.doctor,
        detectiveTargetId: null,
        detectiveFoundMafia: false,
        eliminatedPlayerId: null,
        savedPlayerId: null,
      },
    }

    const state = resolveCurrentRound(initial)

    expect(state.players.find((p) => p.id === IDS.doctor)?.alive).toBe(false)
    expect(state.doctorAlive).toBe(false)
    expect(state.doctorProtectionActive).toBe(false)
    expect(state.doctorProtectedPlayerId).toBe(null)
    expect(canDoctorAct(state)).toBe(false)

    const queue = buildRoundActionQueue(state.players, state.doctorAlive)
    expect(queue).not.toContain(IDS.doctor)
    expect(queue.length).toBeGreaterThan(0)
  })
})
