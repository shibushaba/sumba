import { assignResultsToPlayers } from './assignResultsToPlayers'
import { buildResults } from './buildResults'
import { canStartWriting } from './players'
import type { WritingFields } from './validation'
import type { WhoWhereWhatState } from './types'

export const initialWhoWhereWhatState: WhoWhereWhatState = {
  phase: 'players',
  players: [],
  submissions: [],
  currentPlayerIndex: 0,
  results: null,
  sentenceAssignments: [],
  currentReadingPlayerIndex: 0,
  readingStep: 'announce',
}

export type WhoWhereWhatAction =
  | { type: 'SET_PLAYERS'; players: WhoWhereWhatState['players'] }
  | { type: 'START_WRITING' }
  | { type: 'WRITING_READY_ACK' }
  | { type: 'SUBMIT_WRITING'; fields: WritingFields }
  | { type: 'WRITING_PASS_ACK' }
  | { type: 'START_READING' }
  | { type: 'READING_ANNOUNCE_CONTINUE' }
  | { type: 'READING_PASS_ACK' }
  | { type: 'READING_HIDE_PASS' }
  | { type: 'READING_PASS_OUT_ACK' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'GO_BACK' }

function resetRoundFields(state: WhoWhereWhatState): WhoWhereWhatState {
  return {
    ...state,
    submissions: [],
    currentPlayerIndex: 0,
    results: null,
    sentenceAssignments: [],
    currentReadingPlayerIndex: 0,
    readingStep: 'announce',
  }
}

function finalizeWritingAndBuildStories(
  state: WhoWhereWhatState,
): WhoWhereWhatState {
  const results = buildResults(state.submissions)
  const sentenceAssignments = assignResultsToPlayers(results, state.players)
  return {
    ...state,
    submissions: [],
    results,
    sentenceAssignments,
    phase: 'reading-ready',
    currentReadingPlayerIndex: 0,
    readingStep: 'announce',
  }
}

export function whoWhereWhatReducer(
  state: WhoWhereWhatState,
  action: WhoWhereWhatAction,
): WhoWhereWhatState {
  switch (action.type) {
    case 'SET_PLAYERS':
      return { ...state, players: action.players }

    case 'START_WRITING':
      if (!canStartWriting(state)) return state
      return {
        ...resetRoundFields(state),
        phase: 'writing-ready',
      }

    case 'WRITING_READY_ACK':
      if (state.phase !== 'writing-ready') return state
      return { ...state, phase: 'writing' }

    case 'SUBMIT_WRITING': {
      if (state.phase !== 'writing') return state
      const player = state.players[state.currentPlayerIndex]
      if (!player) return state
      const { who, where, what } = action.fields
      const submissions = [
        ...state.submissions,
        { playerId: player.id, who, where, what },
      ]
      return {
        ...state,
        submissions,
        phase: 'writing-complete',
      }
    }

    case 'WRITING_PASS_ACK': {
      if (state.phase !== 'writing-complete') return state
      const n = state.players.length
      const isLastPlayer = state.currentPlayerIndex >= n - 1
      if (!isLastPlayer) {
        return {
          ...state,
          currentPlayerIndex: state.currentPlayerIndex + 1,
          phase: 'writing-ready',
        }
      }
      return finalizeWritingAndBuildStories(state)
    }

    case 'START_READING':
      if (state.phase !== 'reading-ready' || !state.results?.length) return state
      return {
        ...state,
        phase: 'reading',
        currentReadingPlayerIndex: 0,
        readingStep: 'announce',
      }

    case 'READING_ANNOUNCE_CONTINUE':
      if (state.phase !== 'reading' || state.readingStep !== 'announce') return state
      return { ...state, readingStep: 'pass' }

    case 'READING_PASS_ACK':
      if (state.phase !== 'reading' || state.readingStep !== 'pass') return state
      return { ...state, readingStep: 'show' }

    case 'READING_HIDE_PASS':
      if (state.phase !== 'reading' || state.readingStep !== 'show') return state
      return { ...state, readingStep: 'pass-out' }

    case 'READING_PASS_OUT_ACK': {
      if (state.phase !== 'reading' || state.readingStep !== 'pass-out') {
        return state
      }
      const nextIndex = state.currentReadingPlayerIndex + 1
      if (nextIndex >= state.players.length) {
        return { ...state, phase: 'complete' }
      }
      return {
        ...state,
        currentReadingPlayerIndex: nextIndex,
        readingStep: 'announce',
      }
    }

    case 'PLAY_AGAIN':
      return {
        ...resetRoundFields(state),
        phase: 'players',
      }

    case 'GO_BACK':
      if (state.phase === 'players') return state
      return {
        ...resetRoundFields(state),
        phase: 'players',
      }

    default:
      return state
  }
}

/** Resolve assigned sentence for the current reading player (reducer-internal lookup). */
export function getAssignedSentenceForPlayer(
  state: WhoWhereWhatState,
  playerId: string,
): string | null {
  const assignment = state.sentenceAssignments.find((a) => a.playerId === playerId)
  if (!assignment || !state.results) return null
  const result = state.results.find((r) => r.id === assignment.resultId)
  return result?.sentence ?? null
}
