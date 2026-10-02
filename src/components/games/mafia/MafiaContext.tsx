import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createInitialMafiaState,
  mafiaReducer,
  type MafiaAction,
} from '../../../games/mafia/reducer'
import {
  tryAddPlayer,
  tryRemovePlayer,
  tryUpdatePlayerName,
} from '../../../games/mafia/players'
import {
  clearMafiaSession,
  loadMafiaSession,
  saveMafiaSession,
} from '../../../games/mafia/sessionStorage'
import type { SelectedPlayer } from '../../../players/types'
import type { MafiaGameState, MafiaPlayer } from '../../../games/mafia/types'

export type MafiaPublicState = Omit<MafiaGameState, 'players'> & {
  players: { id: string; name: string; alive: boolean }[]
}

interface MafiaContextValue {
  state: MafiaPublicState
  fullState: MafiaGameState
  dispatch: (action: MafiaAction) => void
  addPlayer: (player: SelectedPlayer) => string | undefined
  removePlayer: (index: number) => string | undefined
  updatePlayerName: (index: number, name: string) => string | undefined
  getPlayerWithRole: (id: string) => MafiaPlayer | undefined
  goBack: () => void
}

const MafiaContext = createContext<MafiaContextValue | null>(null)

function toPublicState(state: MafiaGameState): MafiaPublicState {
  return {
    ...state,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      alive: p.alive,
    })),
  }
}

export function MafiaProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(
    mafiaReducer,
    undefined,
    () => loadMafiaSession() ?? createInitialMafiaState(),
  )

  useEffect(() => {
    saveMafiaSession(state)
  }, [state])

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

  const getPlayerWithRole = useCallback(
    (id: string) => state.players.find((p) => p.id === id),
    [state.players],
  )

  const goBack = useCallback(() => {
    if (state.phase === 'setup' || state.phase === 'players') {
      navigate('/games')
      return
    }
    dispatch({ type: 'GO_BACK' })
  }, [state.phase, navigate])

  const publicState = useMemo(() => toPublicState(state), [state])

  const value = useMemo(
    () => ({
      state: publicState,
      fullState: state,
      dispatch,
      addPlayer,
      removePlayer,
      updatePlayerName,
      getPlayerWithRole,
      goBack,
    }),
    [
      publicState,
      state,
      addPlayer,
      removePlayer,
      updatePlayerName,
      getPlayerWithRole,
      goBack,
    ],
  )

  return <MafiaContext.Provider value={value}>{children}</MafiaContext.Provider>
}

export function useMafia(): MafiaContextValue {
  const ctx = useContext(MafiaContext)
  if (!ctx) throw new Error('useMafia must be used within MafiaProvider')
  return ctx
}

export function useMafiaResetSession(): void {
  useEffect(() => () => clearMafiaSession(), [])
}
