import type { GameEngine, GameResult } from '../../game-engine/core/types'
import {
  imposterReducer,
  initialImposterState,
  type ImposterAction,
} from '../../game-engine/imposter/reducer'
import type { ImposterSetupState } from '../../game-engine/imposter/types'

export const IMPOSTER_ENGINE_VERSION = '2.0.0'

function canDispatch(state: ImposterSetupState, action: ImposterAction): boolean {
  switch (action.type) {
    case 'VOTE_SELECT':
    case 'VOTE_LOCK':
    case 'VOTE_PASS':
      return state.phase === 'voting'
    case 'REVEAL_READY':
    case 'REVEAL_HIDE_PASS':
      return state.phase === 'reveal'
    case 'START_DISCUSSION':
      return state.phase === 'reveal' || state.phase === 'discussion'
    case 'DISCUSSION_END':
      return state.phase === 'discussion'
    case 'RESULTS_ADVANCE':
      return state.phase === 'results'
    case 'PLAY_AGAIN':
      return state.phase === 'leaderboard'
    default:
      return true
  }
}

export const imposterEngine: GameEngine<ImposterSetupState, ImposterAction> = {
  slug: 'imposter',
  engineVersion: IMPOSTER_ENGINE_VERSION,
  createInitialState: () => initialImposterState,
  dispatch: (state, action) => {
    if (!canDispatch(state, action)) return state
    return imposterReducer(state, action)
  },
  canDispatch,
  isGameOver: (state) => state.phase === 'complete',
  getResult: (state): GameResult | null => {
    if (state.phase !== 'leaderboard' && state.phase !== 'complete') return null
    return { winnerLabel: 'Round complete', summary: 'Points awarded' }
  },
}
