import type { GameEngine } from '../../game-engine/core/types'
import {
  initialWhoWhereWhatState,
  whoWhereWhatReducer,
  type WhoWhereWhatAction,
} from './reducer'
import type { WhoWhereWhatState } from './types'
import { GAME_SLUG } from './constants'

export const WHO_WHERE_WHAT_ENGINE_VERSION = '1.0.0'

export const whoWhereWhatEngine: GameEngine<
  WhoWhereWhatState,
  WhoWhereWhatAction
> = {
  slug: GAME_SLUG,
  engineVersion: WHO_WHERE_WHAT_ENGINE_VERSION,
  createInitialState: () => initialWhoWhereWhatState,
  dispatch: (state, action) => whoWhereWhatReducer(state, action),
  isGameOver: (state) => state.phase === 'complete',
}
