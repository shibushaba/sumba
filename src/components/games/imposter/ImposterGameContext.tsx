import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  imposterReducer,
  initialImposterState,
  tryAddSetupPlayer,
  type ImposterAction,
} from '../../../game-engine/imposter/reducer'
import type { SelectedPlayer } from '../../../players/types'
import type { ImposterSetupState } from '../../../game-engine/imposter/types'

interface ImposterGameContextValue {
  state: ImposterSetupState
  dispatch: (action: ImposterAction) => void
  addPlayer: (player: SelectedPlayer) => string | undefined
  goBack: () => void
}

const ImposterGameContext = createContext<ImposterGameContextValue | null>(null)

const IN_ROUND_PHASES = new Set([
  'reveal',
  'discussion',
  'voting',
  'results',
  'leaderboard',
])

export function ImposterGameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(imposterReducer, initialImposterState)
  const navigate = useNavigate()

  const addPlayer = useCallback(
    (player: SelectedPlayer) => {
      const setupPlayer = {
        savedPlayerId: player.id,
        displayName: player.displayName,
      }
      const result = tryAddSetupPlayer(state, setupPlayer)
      if (result.error) return result.error
      dispatch({ type: 'ADD_SETUP_PLAYER', player: setupPlayer })
      return undefined
    },
    [state],
  )

  const goBack = useCallback(() => {
    if (state.phase === 'setup') {
      navigate('/games')
      return
    }
    if (IN_ROUND_PHASES.has(state.phase)) {
      dispatch({ type: 'END_GAME' })
      return
    }
    dispatch({ type: 'GO_BACK' })
  }, [state.phase, navigate])

  const value = useMemo(
    () => ({ state, dispatch, addPlayer, goBack }),
    [state, addPlayer, goBack],
  )

  return (
    <ImposterGameContext.Provider value={value}>
      {children}
    </ImposterGameContext.Provider>
  )
}

export function useImposterGame(): ImposterGameContextValue {
  const ctx = useContext(ImposterGameContext)
  if (!ctx) {
    throw new Error('useImposterGame must be used within ImposterGameProvider')
  }
  return ctx
}

export function useImposterGameOptional(): ImposterGameContextValue | null {
  return useContext(ImposterGameContext)
}
