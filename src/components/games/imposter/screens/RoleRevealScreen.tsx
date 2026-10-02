import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { PassPhoneScreen } from '../../PassPhoneScreen'
import { RoleReveal } from '../RoleReveal'
import { GameButton } from '../GameButton'

export function RoleRevealScreen() {
  const { state, dispatch } = useImposterGame()
  const round = state.round
  if (!round) return null

  const { revealIndex, revealStep, players } = round
  const current = players[revealIndex]

  if (revealStep === 'group-ready') {
    return (
      <GameShell immersive>
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-3xl font-black uppercase">Everyone has their word.</p>
          <p className="mt-4 text-sm text-muted">Get ready.</p>
          <div className="mt-10 w-full max-w-sm">
            <GameButton fullWidth onClick={() => dispatch({ type: 'START_DISCUSSION' })}>
              Start discussion
            </GameButton>
          </div>
        </div>
      </GameShell>
    )
  }

  if (revealStep === 'pass') {
    return (
      <GameShell immersive>
        <PassPhoneScreen
          playerName={current.name}
          currentIndex={revealIndex + 1}
          totalPlayers={players.length}
          onReady={() => dispatch({ type: 'REVEAL_READY' })}
        />
      </GameShell>
    )
  }

  if (revealStep === 'content') {
    return (
      <GameShell immersive>
        <RoleReveal
          isImposter={current.isImposter}
          secretWord={current.isImposter ? '' : round.secretWord}
          onHide={() => dispatch({ type: 'REVEAL_HIDE_PASS' })}
        />
      </GameShell>
    )
  }

  return null
}
