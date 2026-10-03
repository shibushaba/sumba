import { describe, expect, it, vi, afterEach } from 'vitest'
import * as random from '../../utils/random'
import {
  createInitialMafiaState,
  mafiaReducer,
} from './reducer'
import type { MafiaPlayer } from './types'

const SIX_PLAYERS: MafiaPlayer[] = [
  { id: 'shibu', name: 'Shibu', role: 'civilian', alive: true },
  { id: 'hima', name: 'Hima', role: 'civilian', alive: true },
  { id: 'dia', name: 'Dia', role: 'civilian', alive: true },
  { id: 'shanu', name: 'Shanu', role: 'civilian', alive: true },
  { id: 'firoz', name: 'Firoz', role: 'civilian', alive: true },
  { id: 'minnu', name: 'Minnu', role: 'civilian', alive: true },
]

function beginGame(state = createInitialMafiaState()) {
  return mafiaReducer(
    { ...state, phase: 'players', players: SIX_PLAYERS },
    { type: 'BEGIN_ROLE_ASSIGNMENT' },
  )
}

describe('role reveal session', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('assigns roles once and enters role-reveal with a reveal order', () => {
    const state = beginGame()
    expect(state.phase).toBe('role-reveal')
    expect(state.rolesAssigned).toBe(true)
    expect(state.revealOrder).toHaveLength(6)
    expect(new Set(state.revealOrder).size).toBe(6)
    expect(countSpecial(state.players)).toEqual({
      mafia: 1,
      doctor: 1,
      detective: 1,
      civilian: 3,
    })
  })

  it('does not reassign roles when BEGIN_ROLE_ASSIGNMENT runs again', () => {
    const first = beginGame()
    const second = mafiaReducer(first, { type: 'BEGIN_ROLE_ASSIGNMENT' })
    expect(second.players).toEqual(first.players)
    expect(second.revealOrder).toEqual(first.revealOrder)
  })

  it('keeps role assignments and reveal order across benign updates', () => {
    const started = beginGame()
    const afterPass = mafiaReducer(started, { type: 'PASS_ACK' })
    const afterTap = mafiaReducer(afterPass, { type: 'TAP_REVEAL' })
    expect(afterTap.players).toEqual(started.players)
    expect(afterTap.revealOrder).toEqual(started.revealOrder)
    expect(afterTap.revealIndex).toBe(started.revealIndex)
  })

  it('starts round action only after all role reveals', () => {
    let state = beginGame()
    for (let i = 0; i < 6; i++) {
      state = mafiaReducer(state, { type: 'PASS_ACK' })
      state = mafiaReducer(state, { type: 'TAP_REVEAL' })
      state = mafiaReducer(state, { type: 'ROLE_NEXT' })
    }
    expect(state.phase).toBe('round-action')
    expect(state.actionQueue.length).toBeGreaterThan(0)
  })

  it('recovered session keeps immutable role mapping', () => {
    vi.spyOn(random, 'secureShuffle').mockImplementationOnce((items) => [
      items[5]!,
      items[2]!,
      items[1]!,
      items[0]!,
      items[3]!,
      items[4]!,
    ])
    vi.spyOn(random, 'secureShuffle').mockImplementationOnce((items) => [
      items[4]!,
      items[0]!,
      items[5]!,
      items[3]!,
      items[1]!,
      items[2]!,
    ])

    const started = beginGame()
    const recovered = {
      ...started,
      roleRevealStep: 'pass' as const,
      revealIndex: 2,
    }
    const resumed = mafiaReducer(recovered, { type: 'BEGIN_ROLE_ASSIGNMENT' })
    expect(resumed.players).toEqual(started.players)
    expect(resumed.revealOrder).toEqual(started.revealOrder)
    expect(resumed.revealIndex).toBe(2)
  })
})

function countSpecial(players: MafiaPlayer[]) {
  return players.reduce(
    (acc, p) => {
      acc[p.role] += 1
      return acc
    },
    { mafia: 0, doctor: 0, detective: 0, civilian: 0 },
  )
}
