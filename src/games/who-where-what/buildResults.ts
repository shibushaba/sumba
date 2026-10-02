import { formatSentence } from './getBeVerb'
import type { Submission, WhoWhereWhatResult } from './types'

function createResultId(index: number, playerId: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `r-${index}-${playerId}`
}

/**
 * Rotates WHO / WHERE / WHAT columns like passing a paper around the circle.
 * Result i: WHO from player i, WHERE from (i+1), WHAT from (i+2).
 */
export function buildResults(submissions: Submission[]): WhoWhereWhatResult[] {
  const n = submissions.length
  if (n === 0) return []

  return submissions.map((_, i) => {
    const who = submissions[i].who
    const where = submissions[(i + 1) % n].where
    const what = submissions[(i + 2) % n].what
    const sentence = formatSentence(who, what, where)
    return {
      id: createResultId(i, submissions[i].playerId),
      who,
      what,
      where,
      sentence,
    }
  })
}
