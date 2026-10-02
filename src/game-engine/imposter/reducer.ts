import { buildRound, isValidImposterCount, MAX_PLAYERS, MIN_PLAYERS } from './engine'
import { calculateRoundPoints } from './scoring'
import type { ImposterSetupPlayer, ImposterSetupState, PackChoice } from './types'

export const initialImposterState: ImposterSetupState = {
  phase: 'setup',
  setupPlayers: [],
  imposterCount: 1,
  packChoice: 'random',
  specialPackId: null,
  specialPackLabel: null,
  round: null,
  isActive: false,
  playAgainFromLeaderboard: false,
}

export type ImposterAction =
  | { type: 'START_GAME' }
  | { type: 'GO_BACK' }
  | { type: 'BACK_TO_SETUP' }
  | { type: 'ADD_SETUP_PLAYER'; player: ImposterSetupPlayer }
  | { type: 'REMOVE_PLAYER'; index: number }
  | { type: 'GO_TO_IMPOSTER_COUNT' }
  | { type: 'SET_IMPOSTER_COUNT'; count: 1 | 2 }
  | { type: 'GO_TO_PACK_SELECTION' }
  | {
      type: 'SET_PACK'
      choice: PackChoice
      specialPackId?: string | null
      specialPackLabel?: string | null
    }
  | { type: 'START_ROUND'; secretWord: string }
  | { type: 'ROUND_READY_START' }
  | { type: 'REVEAL_READY' }
  | { type: 'REVEAL_HIDE_PASS' }
  | { type: 'START_DISCUSSION' }
  | { type: 'DISCUSSION_END' }
  | { type: 'VOTE_SELECT'; targetId: string }
  | { type: 'VOTE_LOCK' }
  | { type: 'VOTE_PASS' }
  | { type: 'VOTES_COMPLETE_CONTINUE' }
  | { type: 'RESULTS_ADVANCE' }
  | { type: 'GO_TO_LEADERBOARD' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'BACK_TO_GAMES' }
  | { type: 'END_GAME' }
  | { type: 'MARK_ROUND_SUBMITTED' }

export interface AddPlayerResult {
  state: ImposterSetupState
  error?: string
}

export function tryAddSetupPlayer(
  state: ImposterSetupState,
  player: ImposterSetupPlayer,
): AddPlayerResult {
  if (!player.displayName.trim()) {
    return { state, error: 'Enter a player name.' }
  }
  const exists = state.setupPlayers.some((p) => p.savedPlayerId === player.savedPlayerId)
  if (exists) {
    return { state, error: 'That player is already in this game.' }
  }
  if (state.setupPlayers.length >= MAX_PLAYERS) {
    return { state, error: `Maximum ${MAX_PLAYERS} players.` }
  }
  return {
    state: {
      ...state,
      setupPlayers: [...state.setupPlayers, player],
    },
  }
}

function withRound(
  state: ImposterSetupState,
  updater: (round: NonNullable<ImposterSetupState['round']>) => NonNullable<ImposterSetupState['round']>,
): ImposterSetupState {
  if (!state.round) return state
  const round = updater(state.round)
  return { ...state, round, phase: round.phase }
}

export function imposterReducer(
  state: ImposterSetupState,
  action: ImposterAction,
): ImposterSetupState {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, phase: 'players', isActive: true }
    case 'GO_BACK':
      switch (state.phase) {
        case 'players':
          return { ...state, phase: 'setup' }
        case 'imposter-count':
          return { ...state, phase: 'players' }
        case 'pack-selection':
          return { ...state, phase: 'imposter-count' }
        case 'round-ready':
          return { ...state, phase: 'pack-selection', round: null }
        case 'results':
          if (!state.round || state.round.resultsStep === 'imposters') return state
          return withRound(state, (round) => {
            const order = [
              'imposters',
              'word',
              'caught',
              'missed',
              'round-points',
              'done',
            ] as const
            const idx = order.indexOf(round.resultsStep)
            const prev = order[Math.max(0, idx - 1)]
            return { ...round, resultsStep: prev }
          })
        case 'leaderboard':
          return { ...state, phase: 'results', round: state.round }
        default:
          return state
      }
    case 'BACK_TO_SETUP':
      return { ...initialImposterState, phase: 'setup' }
    case 'ADD_SETUP_PLAYER':
      return tryAddSetupPlayer(state, action.player).state
    case 'REMOVE_PLAYER':
      return {
        ...state,
        setupPlayers: state.setupPlayers.filter((_, i) => i !== action.index),
      }
    case 'GO_TO_IMPOSTER_COUNT':
      if (state.setupPlayers.length < MIN_PLAYERS) return state
      return { ...state, phase: 'imposter-count' }
    case 'SET_IMPOSTER_COUNT': {
      if (!isValidImposterCount(state.setupPlayers.length, action.count)) return state
      return { ...state, imposterCount: action.count }
    }
    case 'GO_TO_PACK_SELECTION':
      if (!isValidImposterCount(state.setupPlayers.length, state.imposterCount)) return state
      return { ...state, phase: 'pack-selection' }
    case 'SET_PACK':
      return {
        ...state,
        packChoice: action.choice,
        specialPackId: action.specialPackId ?? null,
        specialPackLabel: action.specialPackLabel ?? null,
      }
    case 'START_ROUND': {
      const packId =
        state.packChoice === 'special' && state.specialPackId
          ? state.specialPackId
          : state.packChoice
      const packLabel =
        state.packChoice === 'random'
          ? 'RANDOM'
          : state.packChoice === 'malayalam'
            ? 'MALAYALAM'
            : (state.specialPackLabel ?? 'SPECIAL').toUpperCase()
      const roundNumber = state.round ? state.round.roundNumber + 1 : 1
      const recent = state.round?.recentWords ?? []
      const round = buildRound({
        setupPlayers: state.setupPlayers,
        imposterCount: state.imposterCount,
        secretWord: action.secretWord,
        packId,
        packLabel,
        roundNumber,
        recentWords: recent,
      })
      return { ...state, round, phase: 'round-ready', isActive: true }
    }
    case 'ROUND_READY_START':
      return withRound(state, (round) => ({
        ...round,
        phase: 'reveal',
        revealStep: 'pass',
        revealIndex: 0,
      }))
    case 'REVEAL_READY':
      return withRound(state, (round) => ({ ...round, revealStep: 'content' }))
    case 'REVEAL_HIDE_PASS':
      return withRound(state, (round) => {
        if (round.revealStep === 'content') {
          const isLast = round.revealIndex >= round.players.length - 1
          if (isLast) {
            return { ...round, revealStep: 'group-ready' }
          }
          return {
            ...round,
            revealStep: 'pass',
            revealIndex: round.revealIndex + 1,
          }
        }
        return round
      })
    case 'START_DISCUSSION':
      return withRound(state, (round) => ({
        ...round,
        phase: 'discussion',
        revealStep: 'pass',
        discussionEndsAt: Date.now() + 300_000,
      }))
    case 'DISCUSSION_END':
      return withRound(state, (round) => ({
        ...round,
        phase: 'voting',
        votingIndex: 0,
        votingStep: 'pass',
        discussionEndsAt: null,
      }))
    case 'VOTE_SELECT': {
      return withRound(state, (round) => {
        const voter = round.players[round.votingIndex]
        if (!voter || action.targetId === voter.id) {
          return {
            ...round,
            voteError: "You can't vote for yourself.",
            draftTargetId: null,
          }
        }
        return {
          ...round,
          draftTargetId: action.targetId,
          voteError: null,
        }
      })
    }
    case 'VOTE_LOCK': {
      return withRound(state, (round) => {
        const voter = round.players[round.votingIndex]
        if (!voter || !round.draftTargetId) return round
        if (round.draftTargetId === voter.id) {
          return { ...round, voteError: "You can't vote for yourself." }
        }
        const votes = [
          ...round.votes,
          { voterId: voter.id, targetId: round.draftTargetId },
        ]
        return {
          ...round,
          votes,
          votingStep: 'locked',
          draftTargetId: null,
          voteError: null,
        }
      })
    }
    case 'VOTE_PASS': {
      return withRound(state, (round) => {
        if (round.votingStep === 'pass') {
          return { ...round, votingStep: 'select' }
        }
        if (round.votingStep !== 'locked') return round
        const isLast = round.votingIndex >= round.players.length - 1
        if (isLast) {
          return {
            ...round,
            votingStep: 'all-done',
          }
        }
        return {
          ...round,
          votingIndex: round.votingIndex + 1,
          votingStep: 'pass',
          draftTargetId: null,
        }
      })
    }
    case 'VOTES_COMPLETE_CONTINUE': {
      return withRound(state, (round) => {
        const pointsEarned = calculateRoundPoints(
          round.players,
          round.imposterIds,
          round.votes,
        )
        return {
          ...round,
          phase: 'results',
          resultsStep: 'imposters',
          pointsEarned,
          votingStep: 'select',
        }
      })
    }
    case 'RESULTS_ADVANCE': {
      return withRound(state, (round) => {
        const order: typeof round.resultsStep[] = [
          'imposters',
          'word',
          'caught',
          'missed',
          'round-points',
          'done',
        ]
        const idx = order.indexOf(round.resultsStep)
        const next = order[idx + 1] ?? 'done'
        if (next === 'done') {
          return { ...round, resultsStep: next, phase: 'leaderboard' }
        }
        return { ...round, resultsStep: next }
      })
    }
    case 'GO_TO_LEADERBOARD':
      return withRound(state, (round) => ({ ...round, phase: 'leaderboard' }))
    case 'PLAY_AGAIN':
      return {
        ...state,
        phase: 'pack-selection',
        round: null,
        playAgainFromLeaderboard: false,
      }
    case 'BACK_TO_GAMES':
    case 'END_GAME':
      return { ...initialImposterState }
    case 'MARK_ROUND_SUBMITTED':
      return withRound(state, (round) => ({ ...round, roundSubmitted: true }))
    default:
      return state
  }
}
