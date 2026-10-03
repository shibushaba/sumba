import { assignRoles, createRevealOrder } from './assignRoles'
import { buildRoundActionQueue } from './actionQueue'
import { createSessionId } from './ids'
import { canStartMafia } from './players'
import { doctorProtectionForNewRound, syncDoctorState } from './doctorState'
import { resolveRound } from './resolveRound'
import type {
  MafiaGameState,
  MafiaPlayer,
  MafiaRoundState,
  PrivateNotifyItem,
} from './types'

function emptyRound(roundNumber: 1 | 2 | 3): MafiaRoundState {
  return {
    roundNumber,
    mafiaTargetId: null,
    detectiveTargetId: null,
    detectiveFoundMafia: false,
    eliminatedPlayerId: null,
    savedPlayerId: null,
  }
}

export function createInitialMafiaState(): MafiaGameState {
  return {
    phase: 'setup',
    sessionId: createSessionId(),
    players: [],
    currentRound: 1,
    round: emptyRound(1),
    doctorProtectedPlayerId: null,
    doctorProtectionActive: false,
    doctorPlayerId: null,
    doctorAlive: false,
    actionQueue: [],
    actionIndex: 0,
    actionStep: 'pass',
    pendingMafiaTargetId: null,
    notifyQueue: [],
    notifyIndex: 0,
    winner: null,
    winReason: null,
    roundsCompleted: 0,
    scoreSubmitted: false,
    rolesAssigned: false,
    revealOrder: [],
    revealIndex: 0,
    roleRevealStep: 'pass',
    doctorSavesCount: 0,
  }
}

export type MafiaAction =
  | { type: 'START_PLAYERS' }
  | { type: 'SET_PLAYERS'; players: MafiaPlayer[] }
  | { type: 'BEGIN_ROLE_ASSIGNMENT' }
  | { type: 'PASS_ACK' }
  | { type: 'TAP_REVEAL' }
  | { type: 'ROLE_NEXT' }
  | { type: 'MAFIA_SELECT'; targetId: string }
  | { type: 'MAFIA_KILL' }
  | { type: 'DOCTOR_PROTECT'; targetId: string }
  | { type: 'DOCTOR_SKIP_ACTIVE' }
  | { type: 'DETECTIVE_INVESTIGATE'; targetId: string }
  | { type: 'DETECTIVE_CONTINUE' }
  | { type: 'CIVILIAN_DONE' }
  | { type: 'ACTION_DONE' }
  | { type: 'NOTIFY_ACK' }
  | { type: 'START_NEXT_ROUND' }
  | { type: 'GO_TO_LEADERBOARD' }
  | { type: 'MARK_SCORE_SUBMITTED' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'GO_BACK' }

function getPlayer(state: MafiaGameState, id: string): MafiaPlayer | undefined {
  return state.players.find((p) => p.id === id)
}

function getDetective(state: MafiaGameState): MafiaPlayer | undefined {
  return state.players.find((p) => p.role === 'detective')
}

function advanceRoleReveal(state: MafiaGameState): MafiaGameState {
  const nextIndex = state.revealIndex + 1
  if (nextIndex >= state.revealOrder.length) {
    return startRoundAction(state)
  }
  return {
    ...state,
    revealIndex: nextIndex,
    roleRevealStep: 'pass',
  }
}

function startRoundAction(state: MafiaGameState): MafiaGameState {
  const synced = syncDoctorState(state)
  const protection = doctorProtectionForNewRound(synced)
  const queue = buildRoundActionQueue(synced.players, synced.doctorAlive)
  return {
    ...synced,
    ...protection,
    phase: 'round-action',
    actionQueue: queue,
    actionIndex: 0,
    actionStep: 'pass',
    round: emptyRound(state.currentRound),
    pendingMafiaTargetId: null,
  }
}

function advanceAction(state: MafiaGameState): MafiaGameState {
  const nextIndex = state.actionIndex + 1
  if (nextIndex >= state.actionQueue.length) {
    return beginResolve(state)
  }
  return {
    ...state,
    actionIndex: nextIndex,
    actionStep: 'pass',
    pendingMafiaTargetId: null,
  }
}

function gameOverDetective(state: MafiaGameState): MafiaGameState {
  return {
    ...state,
    phase: 'game-over',
    winner: 'detective',
    winReason: 'detective-found',
    roundsCompleted: state.currentRound,
  }
}

function gameOverMafiaKilledDetective(state: MafiaGameState): MafiaGameState {
  return {
    ...state,
    phase: 'game-over',
    winner: 'mafia',
    winReason: 'detective-killed',
    roundsCompleted: state.currentRound,
  }
}

function gameOverMafiaSurvived(state: MafiaGameState): MafiaGameState {
  return {
    ...state,
    phase: 'game-over',
    winner: 'mafia',
    winReason: 'mafia-survived',
    roundsCompleted: state.currentRound,
  }
}

/** Exported for unit tests — resolves Mafia kill vs Doctor protection for the current round. */
export function resolveCurrentRound(state: MafiaGameState): MafiaGameState {
  return beginResolve(state)
}

function beginResolve(state: MafiaGameState): MafiaGameState {
  if (state.round.detectiveFoundMafia) {
    return gameOverDetective(state)
  }

  const resolved = resolveRound({
    mafiaTargetId: state.round.mafiaTargetId,
    doctorProtectedPlayerId: state.doctorProtectedPlayerId,
    doctorProtectionActive: state.doctorProtectionActive,
  })

  let players = state.players
  if (resolved.eliminatedPlayerId) {
    players = players.map((p) =>
      p.id === resolved.eliminatedPlayerId ? { ...p, alive: false } : p,
    )
  }

  const detective = getDetective({ ...state, players })
  const killedDetective =
    detective &&
    resolved.eliminatedPlayerId === detective.id &&
    !resolved.savedPlayerId

  const round = {
    ...state.round,
    eliminatedPlayerId: resolved.eliminatedPlayerId,
    savedPlayerId: resolved.savedPlayerId,
  }

  const doctorSavesCount =
    resolved.savedPlayerId
      ? state.doctorSavesCount + 1
      : state.doctorSavesCount

  const base = syncDoctorState({
    ...state,
    players,
    round,
    doctorProtectedPlayerId: resolved.doctorProtectedPlayerId,
    doctorProtectionActive: resolved.doctorProtectionActive,
    doctorSavesCount,
    roundsCompleted: state.currentRound,
  })

  if (killedDetective) {
    return gameOverMafiaKilledDetective(base)
  }

  const notifyQueue: PrivateNotifyItem[] = []
  if (resolved.eliminatedPlayerId) {
    notifyQueue.push({
      kind: 'eliminated',
      playerId: resolved.eliminatedPlayerId,
    })
  }
  if (resolved.savedPlayerId) {
    notifyQueue.push({ kind: 'saved', playerId: resolved.savedPlayerId })
  }

  if (notifyQueue.length === 0) {
    return { ...base, phase: 'round-result' }
  }

  return {
    ...base,
    phase: 'private-notify',
    notifyQueue,
    notifyIndex: 0,
  }
}

function afterPrivateNotify(state: MafiaGameState): MafiaGameState {
  if (state.notifyIndex + 1 < state.notifyQueue.length) {
    return { ...state, notifyIndex: state.notifyIndex + 1 }
  }
  return { ...state, phase: 'round-result', notifyIndex: 0, notifyQueue: [] }
}

function afterRoundResult(state: MafiaGameState): MafiaGameState {
  if (state.winner === 'detective') {
    return { ...state, phase: 'game-over' }
  }
  if (state.currentRound >= 3) {
    return gameOverMafiaSurvived(state)
  }
  const nextRound = (state.currentRound + 1) as 1 | 2 | 3
  return startRoundAction({ ...state, currentRound: nextRound })
}

function currentActionPlayer(state: MafiaGameState): MafiaPlayer | undefined {
  const id = state.actionQueue[state.actionIndex]
  return id ? getPlayer(state, id) : undefined
}

export function mafiaReducer(
  state: MafiaGameState,
  action: MafiaAction,
): MafiaGameState {
  switch (action.type) {
    case 'START_PLAYERS':
      return { ...state, phase: 'players' }

    case 'SET_PLAYERS':
      return { ...state, players: action.players }

    case 'BEGIN_ROLE_ASSIGNMENT': {
      if (!canStartMafia(state) || state.rolesAssigned) return state
      const roster = state.players.map((p) => ({ id: p.id, name: p.name }))
      const players = assignRoles(roster)
      const revealOrder = createRevealOrder(roster)
      return syncDoctorState({
        ...state,
        phase: 'role-reveal',
        players,
        rolesAssigned: true,
        revealOrder,
        revealIndex: 0,
        roleRevealStep: 'pass',
        doctorAlive: true,
      })
    }

    case 'PASS_ACK': {
      if (state.phase === 'role-reveal' && state.roleRevealStep === 'pass') {
        return { ...state, roleRevealStep: 'reveal' }
      }
      if (state.phase !== 'round-action' || state.actionStep !== 'pass') {
        return state
      }
      const player = currentActionPlayer(state)
      if (!player) return advanceAction(state)
      if (!player.alive) {
        return { ...state, actionStep: 'out' }
      }
      return { ...state, actionStep: 'reveal' }
    }

    case 'TAP_REVEAL':
      if (state.phase === 'role-reveal' && state.roleRevealStep === 'reveal') {
        return { ...state, roleRevealStep: 'role' }
      }
      if (state.phase !== 'round-action' || state.actionStep !== 'reveal') {
        return state
      }
      return { ...state, actionStep: 'role' }

    case 'ROLE_NEXT':
      if (state.phase === 'role-reveal' && state.roleRevealStep === 'role') {
        return advanceRoleReveal(state)
      }
      if (state.phase !== 'round-action' || state.actionStep !== 'role') {
        return state
      }
      return { ...state, actionStep: 'action' }

    case 'MAFIA_SELECT':
      return { ...state, pendingMafiaTargetId: action.targetId }

    case 'MAFIA_KILL': {
      const targetId = state.pendingMafiaTargetId
      if (!targetId || state.actionStep !== 'action') return state
      return {
        ...state,
        round: { ...state.round, mafiaTargetId: targetId },
        actionStep: 'done',
        pendingMafiaTargetId: null,
      }
    }

    case 'DOCTOR_PROTECT': {
      if (!state.doctorAlive || state.actionStep !== 'action') return state
      const doctorId =
        state.doctorPlayerId ??
        state.players.find((p) => p.role === 'doctor')?.id
      if (doctorId && action.targetId === doctorId) return state
      return {
        ...state,
        doctorProtectedPlayerId: action.targetId,
        doctorProtectionActive: true,
        actionStep: 'done',
      }
    }

    case 'DOCTOR_SKIP_ACTIVE':
      if (state.phase !== 'round-action') return state
      return { ...state, actionStep: 'done' }

    case 'DETECTIVE_INVESTIGATE': {
      if (state.actionStep !== 'action') return state
      const target = getPlayer(state, action.targetId)
      const found = target?.role === 'mafia'
      if (found) {
        return gameOverDetective({
          ...state,
          round: {
            ...state.round,
            detectiveTargetId: action.targetId,
            detectiveFoundMafia: true,
          },
        })
      }
      return {
        ...state,
        round: {
          ...state.round,
          detectiveTargetId: action.targetId,
          detectiveFoundMafia: false,
        },
        actionStep: 'detective-result',
      }
    }

    case 'DETECTIVE_CONTINUE':
      if (state.actionStep !== 'detective-result') return state
      return { ...state, actionStep: 'done' }

    case 'CIVILIAN_DONE':
      if (state.actionStep !== 'action') return state
      return { ...state, actionStep: 'done' }

    case 'ACTION_DONE':
      if (state.phase === 'round-action') {
        if (state.actionStep === 'out' || state.actionStep === 'done') {
          return advanceAction(state)
        }
      }
      return state

    case 'NOTIFY_ACK':
      return afterPrivateNotify(state)

    case 'START_NEXT_ROUND':
      return afterRoundResult(state)

    case 'GO_TO_LEADERBOARD':
      return { ...state, phase: 'leaderboard' }

    case 'MARK_SCORE_SUBMITTED':
      return { ...state, scoreSubmitted: true }

    case 'PLAY_AGAIN':
      return createInitialMafiaState()

    case 'GO_BACK':
      if (state.phase === 'setup' || state.phase === 'players') return state
      if (state.phase === 'leaderboard') {
        return { ...state, phase: 'game-over' }
      }
      return {
        ...createInitialMafiaState(),
        phase: 'players',
      }

    default:
      return state
  }
}

export function getPublicRoundOutcome(state: MafiaGameState): {
  eliminatedName: string | null
  nobodyEliminated: boolean
} {
  if (state.round.eliminatedPlayerId) {
    const p = getPlayer(state, state.round.eliminatedPlayerId)
    return { eliminatedName: p?.name ?? null, nobodyEliminated: false }
  }
  if (state.round.savedPlayerId) {
    return { eliminatedName: null, nobodyEliminated: true }
  }
  return { eliminatedName: null, nobodyEliminated: true }
}
