import { describe, expect, it } from 'vitest'
import { buildResults } from './buildResults'
import type { Submission } from './types'

function subs(
  entries: { id: string; who: string; where: string; what: string }[],
): Submission[] {
  return entries.map((e) => ({
    playerId: e.id,
    who: e.who,
    where: e.where,
    what: e.what,
  }))
}

describe('buildResults', () => {
  it('rotates columns for 3 players', () => {
    const submissions = subs([
      { id: 'a', who: 'A-WHO', where: 'A-WHERE', what: 'A-WHAT' },
      { id: 'b', who: 'B-WHO', where: 'B-WHERE', what: 'B-WHAT' },
      { id: 'c', who: 'C-WHO', where: 'C-WHERE', what: 'C-WHAT' },
    ])

    const results = buildResults(submissions)

    expect(results).toHaveLength(3)
    expect(results[0].who).toBe('A-WHO')
    expect(results[0].what).toBe('C-WHAT')
    expect(results[0].where).toBe('B-WHERE')
    expect(results[0].sentence).toBe('A-WHO was C-WHAT B-WHERE.')
    expect(results[0].id).toBeTruthy()
  })

  it('handles 4 players with correct wrap', () => {
    const submissions = subs(
      ['p1', 'p2', 'p3', 'p4'].map((id) => ({
        id,
        who: `${id}-WHO`,
        where: `${id}-WHERE`,
        what: `${id}-WHAT`,
      })),
    )
    const results = buildResults(submissions)
    expect(results).toHaveLength(4)
    expect(results[0].who).toBe('p1-WHO')
    expect(results[0].where).toBe('p2-WHERE')
    expect(results[0].what).toBe('p3-WHAT')
  })

  it('handles 5 players', () => {
    const submissions = subs(
      ['A', 'B', 'C', 'D', 'E'].map((id) => ({
        id,
        who: id,
        where: `${id}-w`,
        what: `${id}-t`,
      })),
    )
    const results = buildResults(submissions)
    expect(results).toHaveLength(5)
    expect(results[0]).toMatchObject({ who: 'A', where: 'B-w', what: 'C-t' })
    expect(results[4]).toMatchObject({ who: 'E', where: 'A-w', what: 'B-t' })
  })

  it('uses exactly one who/what/where from each column across results', () => {
    const submissions = subs([
      { id: '1', who: 'w1', where: 'h1', what: 't1' },
      { id: '2', who: 'w2', where: 'h2', what: 't2' },
      { id: '3', who: 'w3', where: 'h3', what: 't3' },
    ])
    const results = buildResults(submissions)
    const whos = results.map((r) => r.who).sort()
    const wheres = results.map((r) => r.where).sort()
    const whats = results.map((r) => r.what).sort()
    expect(whos).toEqual(['w1', 'w2', 'w3'])
    expect(wheres).toEqual(['h1', 'h2', 'h3'])
    expect(whats).toEqual(['t1', 't2', 't3'])
  })

  it('returns empty array for no submissions', () => {
    expect(buildResults([])).toEqual([])
  })
})
