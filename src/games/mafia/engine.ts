import type { GameEngine } from '../../game-engine/core/types'
import { GAME_SLUG } from './constants'
import {
  createInitialMafiaState,
  mafiaReducer,
  type MafiaAction,
} from './reducer'
import type { MafiaGameState } from './types'

export const MAFIA_ENGINE_VERSION = '1.0.0'

export const mafiaEngine: GameEngine<MafiaGameState, MafiaAction> = {
  slug: GAME_SLUG,
  engineVersion: MAFIA_ENGINE_VERSION,
  createInitialState: () => createInitialMafiaState(),
  dispatch: (state, action) => mafiaReducer(state, action),
  isGameOver: (state) =>
    state.phase === 'game-over' || state.phase === 'leaderboard',
}
