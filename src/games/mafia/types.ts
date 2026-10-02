export type MafiaRole = 'mafia' | 'doctor' | 'detective' | 'civilian'

export type MafiaWinner = 'mafia' | 'detective' | null

export type MafiaWinReason =
  | 'detective-found'
  | 'detective-killed'
  | 'mafia-survived'
  | null

export type MafiaPhase =
  | 'setup'
  | 'players'
  | 'round-action'
  | 'private-notify'
  | 'round-result'
  | 'game-over'
  | 'leaderboard'

export interface MafiaPlayer {
  id: string
  name: string
  role: MafiaRole
  alive: boolean
}

export interface MafiaRoundState {
  roundNumber: 1 | 2 | 3
  mafiaTargetId: string | null
  detectiveTargetId: string | null
  detectiveFoundMafia: boolean
  eliminatedPlayerId: string | null
  savedPlayerId: string | null
}

export type PrivateNotifyKind = 'eliminated' | 'saved'

export interface PrivateNotifyItem {
  kind: PrivateNotifyKind
  playerId: string
}

export type ActionStep =
  | 'pass'
  | 'reveal'
  | 'role'
  | 'action'
  | 'detective-result'
  | 'out'
  | 'done'

export interface MafiaGameState {
  phase: MafiaPhase
  sessionId: string
  players: MafiaPlayer[]
  currentRound: 1 | 2 | 3
  round: MafiaRoundState
  doctorProtectedPlayerId: string | null
  doctorProtectionActive: boolean
  doctorPlayerId: string | null
  doctorAlive: boolean
  actionQueue: string[]
  actionIndex: number
  actionStep: ActionStep
  pendingMafiaTargetId: string | null
  notifyQueue: PrivateNotifyItem[]
  notifyIndex: number
  winner: MafiaWinner
  winReason: MafiaWinReason
  roundsCompleted: number
  scoreSubmitted: boolean
  rolesAssigned: boolean
  doctorSavesCount: number
}
