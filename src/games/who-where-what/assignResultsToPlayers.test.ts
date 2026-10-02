import { describe, expect, it } from 'vitest'
import { assignResultsToPlayers } from './assignResultsToPlayers'
import type { WhoWhereWhatPlayer, WhoWhereWhatResult } from './types'

function players(n: number): WhoWhereWhatPlayer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    name: `Player ${i}`,
  }))
}

function results(n: number): WhoWhereWhatResult[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `r${i}`,
    who: `who${i}`,
    what: `what${i}`,
    where: `where${i}`,
    sentence: `Sentence ${i}.`,
  }))
}

describe('assignResultsToPlayers', () => {
  it('assigns every player and every result exactly once', () => {
    const p = players(5)
    const r = results(5)
    const assignments = assignResultsToPlayers(r, p, () => 0.42)

    expect(assignments).toHaveLength(5)
    const playerIds = assignments.map((a) => a.playerId)
    const resultIds = assignments.map((a) => a.resultId)
    expect(new Set(playerIds).size).toBe(5)
    expect(new Set(resultIds).size).toBe(5)
    expect(playerIds).toEqual(p.map((x) => x.id))
  })

  it('does not assume assignment order equals result order', () => {
    const p = players(3)
    const r = results(3)
    let call = 0
    const random = () => {
      call += 1
      return call === 1 ? 0.99 : 0.01
    }
    const assignments = assignResultsToPlayers(r, p, random)
    const mapped = assignments.map((a) => a.resultId)
    expect(mapped).not.toEqual(['r0', 'r1', 'r2'])
  })

  it('is deterministic with injected random', () => {
    const p = players(5)
    const r = results(5)
    const seq = [0.1, 0.2, 0.3, 0.4]
    let i = 0
    const random = () => seq[i++ % seq.length]
    const a1 = assignResultsToPlayers(r, p, random)
    i = 0
    const a2 = assignResultsToPlayers(r, p, random)
    expect(a1).toEqual(a2)
  })

  it('maps players in reading order', () => {
    const p = players(3)
    const r = results(3)
    const assignments = assignResultsToPlayers(r, p, () => 0.5)
    expect(assignments[0].playerId).toBe('p0')
    expect(assignments[1].playerId).toBe('p1')
    expect(assignments[2].playerId).toBe('p2')
  })
})
