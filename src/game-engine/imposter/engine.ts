import { pickRandomIndices, pickRandomWord } from './random'
import type { ImposterPlayer, ImposterRoundState, PackChoice } from './types'

import { MAX_PARTY_PLAYERS } from '../../constants/partyPlayers'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = MAX_PARTY_PLAYERS

export function isValidImposterCount(playerCount: number, imposterCount: 1 | 2): boolean {
  if (imposterCount === 1) return playerCount >= 3
  return playerCount >= 6
}

export function createPlayerId(index: number): string {
  return `p-${index}-${crypto.randomUUID().slice(0, 8)}`
}

export function buildRound(params: {
  setupPlayers: { savedPlayerId: string; displayName: string }[]
  imposterCount: 1 | 2
  secretWord: string
  packId: PackChoice | string
  packLabel: string
  roundNumber: number
  recentWords: string[]
}): ImposterRoundState {
  const players: ImposterPlayer[] = params.setupPlayers.map((p, index) => ({
    id: createPlayerId(index),
    name: p.displayName,
    savedPlayerId: p.savedPlayerId,
    isImposter: false,
  }))

  const imposterIndices = pickRandomIndices(players.length, params.imposterCount)
  const imposterIds = imposterIndices.map((i) => players[i].id)
  for (const index of imposterIndices) {
    players[index].isImposter = true
  }

  const recentWords = [...params.recentWords, params.secretWord].slice(-20)

  return {
    roundId: crypto.randomUUID(),
    roundNumber: params.roundNumber,
    players,
    imposterIds,
    secretWord: params.secretWord,
    packId: params.packId,
    packLabel: params.packLabel,
    imposterCount: params.imposterCount,
    phase: 'round-ready',
    revealIndex: 0,
    revealStep: 'pass',
    votingIndex: 0,
    votingStep: 'select',
    votes: [],
    draftTargetId: null,
    voteError: null,
    discussionEndsAt: null,
    resultsStep: 'imposters',
    pointsEarned: [],
    roundSubmitted: false,
    recentWords,
  }
}

export function pickWordFromPool(
  words: readonly string[],
  recentWords: readonly string[],
): string {
  const avoid = new Set(recentWords.map((w) => w.toLowerCase()))
  const pool = words.filter((w) => !avoid.has(w.toLowerCase()))
  const source = pool.length > 0 ? pool : words
  return pickRandomWord(source)
}
