import { PassPhoneScreen } from '../../PassPhoneScreen'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { RoleCard } from '../RoleCard'
import { useMafia } from '../MafiaContext'

export function RoleRevealScreen() {
  const { fullState, dispatch, getPlayerWithRole, goBack } = useMafia()

  const playerId = fullState.revealOrder[fullState.revealIndex]
  const player = playerId ? getPlayerWithRole(playerId) : undefined
  const step = fullState.roleRevealStep

  if (!playerId || !player) return null

  if (step === 'pass') {
    return (
      <GameShell title="Mafia" onBack={goBack} immersive>
        <PassPhoneScreen
          playerName={player.name}
          currentIndex={fullState.revealIndex + 1}
          totalPlayers={fullState.revealOrder.length}
          onReady={() => dispatch({ type: 'PASS_ACK' })}
        />
      </GameShell>
    )
  }

  if (step === 'reveal') {
    return (
      <GameShell title="Mafia" onBack={goBack} immersive>
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center px-2 text-center">
          <GameButton fullWidth haptic="medium" onClick={() => dispatch({ type: 'TAP_REVEAL' })}>
            Tap to reveal
          </GameButton>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Mafia"
      onBack={goBack}
      immersive
      footer={
        <GameButton fullWidth onClick={() => dispatch({ type: 'ROLE_NEXT' })}>
          {fullState.revealIndex + 1 >= fullState.revealOrder.length
            ? 'Start game'
            : 'Next'}
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center px-2">
        <RoleCard role={player.role} />
      </div>
    </GameShell>
  )
}
