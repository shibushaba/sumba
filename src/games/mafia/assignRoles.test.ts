import { describe, expect, it, vi, afterEach } from 'vitest'
import * as random from '../../utils/random'
import {
  assignMafiaRoles,
  assignRoles,
  applyRoleAssignments,
  countRoles,
  createRevealOrder,
  validateRoleAssignments,
} from './assignRoles'

const SIX_PLAYERS = [
  { id: 'shibu', name: 'Shibu' },
  { id: 'hima', name: 'Hima' },
  { id: 'dia', name: 'Dia' },
  { id: 'shanu', name: 'Shanu' },
  { id: 'firoz', name: 'Firoz' },
  { id: 'minnu', name: 'Minnu' },
]

describe('assignMafiaRoles', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('assigns exactly one of each special role for 5 players', () => {
    const players = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`,
      name: `Player ${i}`,
    }))
    const assignments = assignMafiaRoles(players)
    const assigned = applyRoleAssignments(players, assignments)
    const counts = countRoles(assigned)
    expect(assigned).toHaveLength(5)
    expect(counts.mafia).toBe(1)
    expect(counts.doctor).toBe(1)
    expect(counts.detective).toBe(1)
    expect(counts.civilian).toBe(2)
  })

  it('assigns exactly one of each special role for 12 players', () => {
    const players = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      name: `Player ${i}`,
    }))
    const assignments = assignMafiaRoles(players)
    const assigned = applyRoleAssignments(players, assignments)
    const counts = countRoles(assigned)
    expect(assigned).toHaveLength(12)
    expect(counts.mafia).toBe(1)
    expect(counts.doctor).toBe(1)
    expect(counts.detective).toBe(1)
    expect(counts.civilian).toBe(9)
  })

  it('keys assignments by stable player IDs', () => {
    const assignments = assignMafiaRoles(SIX_PLAYERS, () => 0)
    expect(Object.keys(assignments).sort()).toEqual(
      SIX_PLAYERS.map((p) => p.id).sort(),
    )
  })

  it('does not tie special roles to the first three input positions', () => {
    vi.spyOn(random, 'secureShuffle').mockImplementationOnce((items) => [
      items[5]!,
      items[2]!,
      items[1]!,
      items[0]!,
      items[3]!,
      items[4]!,
    ])

    const assignments = assignMafiaRoles(SIX_PLAYERS)
    expect(assignments.shibu).toBe('civilian')
    expect(assignments.hima).toBe('detective')
    expect(assignments.dia).toBe('doctor')
    expect(assignments.minnu).toBe('mafia')
  })

  it('preserves original player list order in assignRoles output', () => {
    vi.spyOn(random, 'secureShuffle').mockImplementationOnce((items) => [
      items[5]!,
      items[2]!,
      items[1]!,
      items[0]!,
      items[3]!,
      items[4]!,
    ])

    const assigned = assignRoles(SIX_PLAYERS)
    expect(assigned.map((p) => p.id)).toEqual(SIX_PLAYERS.map((p) => p.id))
  })

  it('validateRoleAssignments rejects invalid counts', () => {
    expect(() =>
      validateRoleAssignments(
        {
          shibu: 'mafia',
          hima: 'mafia',
          dia: 'doctor',
          shanu: 'detective',
          firoz: 'civilian',
          minnu: 'civilian',
        },
        SIX_PLAYERS.map((p) => p.id),
      ),
    ).toThrow(/Mafia/)
  })
})

describe('createRevealOrder', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('contains every player exactly once', () => {
    const order = createRevealOrder(SIX_PLAYERS, () => 0)
    expect(order).toHaveLength(SIX_PLAYERS.length)
    expect(new Set(order).size).toBe(SIX_PLAYERS.length)
    expect([...order].sort()).toEqual(SIX_PLAYERS.map((p) => p.id).sort())
  })

  it('is independent from role assignment shuffle', () => {
    let call = 0
    vi.spyOn(random, 'secureShuffle').mockImplementation((items) => {
      call += 1
      if (call === 1) {
        return [items[5]!, items[2]!, items[1]!, items[0]!, items[3]!, items[4]!]
      }
      return [items[4]!, items[0]!, items[5]!, items[3]!, items[1]!, items[2]!]
    })

    const assignments = assignMafiaRoles(SIX_PLAYERS)
    const revealOrder = createRevealOrder(SIX_PLAYERS)

    expect(assignments.minnu).toBe('mafia')
    expect(revealOrder[0]).toBe('firoz')
    expect(revealOrder).not.toEqual(
      Object.entries(assignments)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([id]) => id),
    )
  })
})

describe('assignRoles regression', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('can assign different special roles across repeated sessions', () => {
    const rolesForShibu = new Set<string>()
    const sequences = [
      [5, 2, 1, 0, 3, 4],
      [0, 1, 2, 3, 4, 5],
      [3, 4, 5, 0, 1, 2],
    ]

    for (const order of sequences) {
      vi.spyOn(random, 'secureShuffle').mockImplementationOnce((items) =>
        order.map((i) => items[i]!),
      )
      const assignments = assignMafiaRoles(SIX_PLAYERS)
      rolesForShibu.add(assignments.shibu!)
      vi.restoreAllMocks()
    }

    expect(rolesForShibu.size).toBeGreaterThan(1)
  })

  it('does not assign special roles by list index alone', () => {
    let shibuSpecialCount = 0
    const orders = [
      [0, 1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5, 0],
      [2, 3, 4, 5, 0, 1],
      [3, 4, 5, 0, 1, 2],
    ]

    for (const order of orders) {
      vi.spyOn(random, 'secureShuffle').mockImplementationOnce((items) =>
        order.map((i) => items[i]!),
      )
      const assignments = assignMafiaRoles(SIX_PLAYERS)
      if (['mafia', 'doctor', 'detective'].includes(assignments.shibu!)) {
        shibuSpecialCount += 1
      }
      vi.restoreAllMocks()
    }

    expect(shibuSpecialCount).toBeLessThan(orders.length)
  })
})
