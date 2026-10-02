import type { ImposterPlayer, ImposterVote, RoundPoints } from './types'

export function calculateRoundPoints(
  players: ImposterPlayer[],
  imposterIds: string[],
  votes: ImposterVote[],
): RoundPoints[] {
  const imposterSet = new Set(imposterIds)
  const points = new Map<string, number>()
  for (const p of players) {
    points.set(p.id, 0)
  }

  for (const vote of votes) {
    if (imposterSet.has(vote.targetId)) {
      points.set(vote.voterId, (points.get(vote.voterId) ?? 0) + 1)
    }
  }

  for (const imposterId of imposterIds) {
    const received = votes.filter((v) => v.targetId === imposterId).length
    if (received === 0) {
      points.set(imposterId, (points.get(imposterId) ?? 0) + 1)
    }
  }

  return players.map((p) => ({
    playerId: p.id,
    name: p.name,
    points: points.get(p.id) ?? 0,
  }))
}

export interface VoteOutcomeRow {
  voterName: string
  targetName: string
  correct: boolean
}

export function classifyVotes(
  players: ImposterPlayer[],
  imposterIds: string[],
  votes: ImposterVote[],
): { caught: VoteOutcomeRow[]; missed: VoteOutcomeRow[] } {
  const imposterSet = new Set(imposterIds)
  const byId = new Map(players.map((p) => [p.id, p.name]))
  const caught: VoteOutcomeRow[] = []
  const missed: VoteOutcomeRow[] = []

  for (const vote of votes) {
    const row: VoteOutcomeRow = {
      voterName: byId.get(vote.voterId) ?? '?',
      targetName: byId.get(vote.targetId) ?? '?',
      correct: imposterSet.has(vote.targetId),
    }
    if (row.correct) caught.push(row)
    else missed.push(row)
  }

  return { caught, missed }
}
