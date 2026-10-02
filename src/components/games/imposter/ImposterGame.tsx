import { useEffect, type ReactNode } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import { useGameActivity } from '../../../context/GameActivityContext'
import { useWakeLock } from '../../../hooks/useWakeLock'
import { useImposterGame } from './ImposterGameContext'
import { LeaveGameModal } from './LeaveGameModal'
import { SetupScreen } from './screens/SetupScreen'
import { PlayerSetupScreen } from './screens/PlayerSetupScreen'
import { ImposterCountScreen } from './screens/ImposterCountScreen'
import { PackSelectionScreen } from './screens/PackSelectionScreen'
import { RoundReadyScreen } from './screens/RoundReadyScreen'
import { RoleRevealScreen } from './screens/RoleRevealScreen'
import { DiscussionScreen } from './screens/DiscussionScreen'
import { VotingScreen } from './screens/VotingScreen'
import { ResultScreen } from './screens/ResultScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'

const IN_GAME_PHASES = new Set([
  'round-ready',
  'reveal',
  'discussion',
  'voting',
  'results',
  'leaderboard',
])

export function ImposterGame() {
  const { state, dispatch } = useImposterGame()
  const navigate = useNavigate()
  const { setGameActive } = useGameActivity()

  const inActiveRound =
    state.isActive && state.round !== null && IN_GAME_PHASES.has(state.phase)

  useWakeLock(inActiveRound)

  useEffect(() => {
    setGameActive(inActiveRound)
    return () => setGameActive(false)
  }, [inActiveRound, setGameActive])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      state.isActive &&
      IN_GAME_PHASES.has(state.phase) &&
      currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!inActiveRound) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [inActiveRound])

  function handleStay() {
    blocker.reset?.()
  }

  function handleLeave() {
    dispatch({ type: 'END_GAME' })
    if (blocker.state === 'blocked') {
      blocker.proceed?.()
    } else {
      navigate('/games')
    }
  }

  let screen: ReactNode
  switch (state.phase) {
    case 'setup':
      screen = <SetupScreen />
      break
    case 'players':
      screen = <PlayerSetupScreen />
      break
    case 'imposter-count':
      screen = <ImposterCountScreen />
      break
    case 'pack-selection':
      screen = <PackSelectionScreen />
      break
    case 'round-ready':
      screen = <RoundReadyScreen />
      break
    case 'reveal':
      screen = <RoleRevealScreen />
      break
    case 'discussion':
      screen = <DiscussionScreen />
      break
    case 'voting':
      screen = <VotingScreen />
      break
    case 'results':
      screen = <ResultScreen />
      break
    case 'leaderboard':
      screen = <LeaderboardScreen />
      break
    default:
      screen = <SetupScreen />
  }

  return (
    <>
      {screen}
      <LeaveGameModal
        open={blocker.state === 'blocked'}
        onStay={handleStay}
        onLeave={handleLeave}
      />
    </>
  )
}
