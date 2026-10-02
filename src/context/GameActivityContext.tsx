import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface GameActivityContextValue {
  isGameActive: boolean
  setGameActive: (active: boolean) => void
}

const GameActivityContext = createContext<GameActivityContextValue | null>(null)

export function GameActivityProvider({ children }: { children: ReactNode }) {
  const [isGameActive, setIsGameActive] = useState(false)

  const setGameActive = useCallback((active: boolean) => {
    setIsGameActive(active)
  }, [])

  const value = useMemo(
    () => ({ isGameActive, setGameActive }),
    [isGameActive, setGameActive],
  )

  return (
    <GameActivityContext.Provider value={value}>{children}</GameActivityContext.Provider>
  )
}

export function useGameActivity(): GameActivityContextValue {
  const ctx = useContext(GameActivityContext)
  if (!ctx) {
    return {
      isGameActive: false,
      setGameActive: () => {},
    }
  }
  return ctx
}
