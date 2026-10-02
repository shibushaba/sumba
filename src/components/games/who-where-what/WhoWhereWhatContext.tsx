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
  getAssignedSentenceForPlayer,
  initialWhoWhereWhatState,
  whoWhereWhatReducer,
  type WhoWhereWhatAction,
} from '../../../games/who-where-what/reducer'
import {
  tryAddPlayer,
  tryRemovePlayer,
  tryUpdatePlayerName,
} from '../../../games/who-where-what/players'
import type { SelectedPlayer } from '../../../players/types'
import type { WhoWhereWhatState } from '../../../games/who-where-what/types'

export type WhoWhereWhatPublicState = Omit<
  WhoWhereWhatState,
  'submissions' | 'results' | 'sentenceAssignments'
>

interface WhoWhereWhatContextValue {
  state: WhoWhereWhatPublicState
  dispatch: (action: WhoWhereWhatAction) => void
  addPlayer: (player: SelectedPlayer) => string | undefined
  removePlayer: (index: number) => string | undefined
  updatePlayerName: (index: number, name: string) => string | undefined
  currentPlayerName: string | null
  currentReadingPlayerName: string | null
  currentAssignedSentence: string | null
  goBack: () => void
}

const WhoWhereWhatContext = createContext<WhoWhereWhatContextValue | null>(null)

export function WhoWhereWhatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(whoWhereWhatReducer, initialWhoWhereWhatState)
  const navigate = useNavigate()

  const addPlayer = useCallback(
    (player: SelectedPlayer) => {
      const result = tryAddPlayer(state, player)
      if (result.error) return result.error
      dispatch({ type: 'SET_PLAYERS', players: result.state.players })
      return undefined
    },
    [state],
  )

  const removePlayer = useCallback(
    (index: number) => {
      const result = tryRemovePlayer(state, index)
      if (result.error) return result.error
      dispatch({ type: 'SET_PLAYERS', players: result.state.players })
      return undefined
    },
    [state],
  )

  const updatePlayerName = useCallback(
    (index: number, name: string) => {
      const result = tryUpdatePlayerName(state, index, name)
      if (result.error) return result.error
      dispatch({ type: 'SET_PLAYERS', players: result.state.players })
      return undefined
    },
    [state],
  )

  const goBack = useCallback(() => {
    if (state.phase === 'players') {
      navigate('/games')
      return
    }
    if (state.phase === 'complete') {
      dispatch({ type: 'PLAY_AGAIN' })
      return
    }
    dispatch({ type: 'GO_BACK' })
  }, [state.phase, navigate])

  const currentPlayerName =
    state.phase === 'writing-ready' ||
    state.phase === 'writing' ||
    state.phase === 'writing-complete'
      ? state.players[state.currentPlayerIndex]?.name ?? null
      : null

  const currentReadingPlayerName =
    state.phase === 'reading'
      ? state.players[state.currentReadingPlayerIndex]?.name ?? null
      : null

  const currentAssignedSentence = useMemo(() => {
    if (state.phase !== 'reading' || state.readingStep !== 'show') {
      return null
    }
    const player = state.players[state.currentReadingPlayerIndex]
    if (!player) return null
    return getAssignedSentenceForPlayer(state, player.id)
  }, [state])

  const publicState = useMemo((): WhoWhereWhatPublicState => {
    const {
      submissions: _s,
      results: _r,
      sentenceAssignments: _a,
      ...rest
    } = state
    return rest
  }, [state])

  const value = useMemo(
    () => ({
      state: publicState,
      dispatch,
      addPlayer,
      removePlayer,
      updatePlayerName,
      currentPlayerName,
      currentReadingPlayerName,
      currentAssignedSentence,
      goBack,
    }),
    [
      publicState,
      addPlayer,
      removePlayer,
      updatePlayerName,
      currentPlayerName,
      currentReadingPlayerName,
      currentAssignedSentence,
      goBack,
    ],
  )

  return (
    <WhoWhereWhatContext.Provider value={value}>
      {children}
    </WhoWhereWhatContext.Provider>
  )
}

export function useWhoWhereWhat(): WhoWhereWhatContextValue {
  const ctx = useContext(WhoWhereWhatContext)
  if (!ctx) {
    throw new Error('useWhoWhereWhat must be used within WhoWhereWhatProvider')
  }
  return ctx
}
