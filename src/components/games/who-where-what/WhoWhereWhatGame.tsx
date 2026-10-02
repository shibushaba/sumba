import { useEffect, type ReactNode } from 'react'
import { useGameActivity } from '../../../context/GameActivityContext'
import { useWhoWhereWhat } from './WhoWhereWhatContext'
import { PlayerSetupScreen } from './screens/PlayerSetupScreen'
import { WritingFlowScreen } from './screens/WritingFlowScreen'
import { ReadingReadyScreen } from './screens/ReadingReadyScreen'
import { ReadingFlowScreen } from './screens/ReadingFlowScreen'
import { CompleteScreen } from './screens/CompleteScreen'

const ACTIVE_PHASES = new Set([
  'writing-ready',
  'writing',
  'writing-complete',
  'reading-ready',
  'reading',
])

export function WhoWhereWhatGame() {
  const { state } = useWhoWhereWhat()
  const { setGameActive } = useGameActivity()

  useEffect(() => {
    const active = ACTIVE_PHASES.has(state.phase)
    setGameActive(active)
    return () => setGameActive(false)
  }, [state.phase, setGameActive])

  let screen: ReactNode
  switch (state.phase) {
    case 'players':
      screen = <PlayerSetupScreen />
      break
    case 'writing-ready':
    case 'writing':
    case 'writing-complete':
      screen = <WritingFlowScreen />
      break
    case 'reading-ready':
      screen = <ReadingReadyScreen />
      break
    case 'reading':
      screen = <ReadingFlowScreen />
      break
    case 'complete':
      screen = <CompleteScreen />
      break
    default:
      screen = <PlayerSetupScreen />
  }

  return screen
}
