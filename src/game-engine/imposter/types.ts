/** Imposter V2 — authoritative phase union */
export type ImposterPhase =
  | 'setup'
  | 'players'
  | 'imposter-count'
  | 'pack-selection'
  | 'round-ready'
  | 'reveal'
  | 'discussion'
  | 'voting'
  | 'results'
  | 'leaderboard'
  | 'complete'

export type PackChoice = 'random' | 'malayalam' | 'special'

export type RevealStep = 'pass' | 'content' | 'hide' | 'group-ready'

export type VotingStep = 'select' | 'locked' | 'pass' | 'all-done'

export type ResultsStep =
  | 'imposters'
  | 'word'
  | 'caught'
  | 'missed'
  | 'round-points'
  | 'done'

export interface ImposterPlayer {
  id: string
  name: string
  savedPlayerId: string
  isImposter: boolean
}

export interface ImposterVote {
  voterId: string
  targetId: string
}

export interface RoundPoints {
  playerId: string
  name: string
  points: number
}

export interface ImposterRoundState {
  roundId: string
  roundNumber: number
  players: ImposterPlayer[]
  imposterIds: string[]
  secretWord: string
  packId: PackChoice | string
  packLabel: string
  imposterCount: 1 | 2
  phase: ImposterPhase
  revealIndex: number
  revealStep: RevealStep
  votingIndex: number
  votingStep: VotingStep
  votes: ImposterVote[]
  draftTargetId: string | null
  voteError: string | null
  discussionEndsAt: number | null
  resultsStep: ResultsStep
  pointsEarned: RoundPoints[]
  roundSubmitted: boolean
  recentWords: string[]
}

export interface ImposterSetupPlayer {
  savedPlayerId: string
  displayName: string
}

export interface ImposterSetupState {
  phase: ImposterPhase
  setupPlayers: ImposterSetupPlayer[]
  imposterCount: 1 | 2
  packChoice: PackChoice
  specialPackId: string | null
  specialPackLabel: string | null
  round: ImposterRoundState | null
  isActive: boolean
  playAgainFromLeaderboard: boolean
}
