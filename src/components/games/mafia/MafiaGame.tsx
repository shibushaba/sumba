import { useEffect, type ReactNode } from 'react'
import { useGameActivity } from '../../../context/GameActivityContext'
import { useMafia } from './MafiaContext'
import { SetupScreen } from './screens/SetupScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { RoleRevealScreen } from './screens/RoleRevealScreen'
import { RoundActionScreen } from './screens/RoundActionScreen'
import { PrivateNotifyScreen } from './screens/PrivateNotifyScreen'
import { RoundResultScreen } from './screens/RoundResultScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'

const ACTIVE = new Set([
  'role-reveal',
  'round-action',
  'private-notify',
  'round-result',
  'game-over',
])

export function MafiaGame() {
  const { state } = useMafia()
  const { setGameActive } = useGameActivity()

  useEffect(() => {
    setGameActive(ACTIVE.has(state.phase))
    return () => setGameActive(false)
  }, [state.phase, setGameActive])

  let screen: ReactNode
  switch (state.phase) {
    case 'setup':
      screen = <SetupScreen />
      break
    case 'players':
      screen = <PlayersScreen />
      break
    case 'role-reveal':
      screen = <RoleRevealScreen />
      break
    case 'round-action':
      screen = <RoundActionScreen />
      break
    case 'private-notify':
      screen = <PrivateNotifyScreen />
      break
    case 'round-result':
      screen = <RoundResultScreen />
      break
    case 'game-over':
      screen = <GameOverScreen />
      break
    case 'leaderboard':
      screen = <LeaderboardScreen />
      break
    default:
      screen = <SetupScreen />
  }

  return screen
}
