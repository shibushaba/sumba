export type WhoWhereWhatPhase =
  | 'players'
  | 'writing-ready'
  | 'writing'
  | 'writing-complete'
  | 'reading-ready'
  | 'reading'
  | 'complete'

export type ReadingStep = 'announce' | 'pass' | 'show' | 'pass-out'

export interface WhoWhereWhatPlayer {
  id: string
  name: string
}

export interface Submission {
  playerId: string
  who: string
  where: string
  what: string
}

export interface WhoWhereWhatResult {
  id: string
  who: string
  what: string
  where: string
  sentence: string
}

export interface SentenceAssignment {
  playerId: string
  resultId: string
}

export interface WhoWhereWhatState {
  phase: WhoWhereWhatPhase
  players: WhoWhereWhatPlayer[]
  /** Hidden from UI layers — reducer only */
  submissions: Submission[]
  currentPlayerIndex: number
  /** Generated once before reading — hidden from public UI */
  results: WhoWhereWhatResult[] | null
  sentenceAssignments: SentenceAssignment[]
  currentReadingPlayerIndex: number
  readingStep: ReadingStep
}
