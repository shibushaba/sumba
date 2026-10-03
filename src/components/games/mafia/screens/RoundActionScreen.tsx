import { useEffect, useState } from 'react'
import { livingPlayersExcept } from '../../../../games/mafia/actionQueue'
import { PassPhoneScreen } from '../../PassPhoneScreen'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { RoleCard } from '../RoleCard'
import { PlayerTargetList } from '../PlayerTargetList'
import { useMafia } from '../MafiaContext'
import { playFeedback } from '../../../../motion/feedback'

export function RoundActionScreen() {
  const { fullState, dispatch, getPlayerWithRole, goBack } = useMafia()
  const [pick, setPick] = useState<string | null>(null)

  const playerId = fullState.actionQueue[fullState.actionIndex]
  const player = playerId ? getPlayerWithRole(playerId) : undefined
  const step = fullState.actionStep
  const roundLabel = `Round ${fullState.currentRound}`

  useEffect(() => {
    setPick(null)
  }, [playerId, step, fullState.actionIndex])

  if (!playerId || !player) return null

  if (step === 'pass') {
    return (
      <GameShell title="Mafia" onBack={goBack} progress={roundLabel} immersive>
        <PassPhoneScreen
          playerName={player.name}
          currentIndex={fullState.actionIndex + 1}
          totalPlayers={fullState.actionQueue.length}
          onReady={() => dispatch({ type: 'PASS_ACK' })}
        />
      </GameShell>
    )
  }

  if (step === 'out') {
    return (
      <GameShell title="Mafia" onBack={goBack} immersive>
        <div className="game-phase-enter motion-out-fade flex flex-1 flex-col items-center justify-center text-center px-2">
          <p className="font-display text-2xl font-black uppercase">You are out</p>
          <div className="mt-10 w-full max-w-sm">
            <GameButton fullWidth onClick={() => dispatch({ type: 'ACTION_DONE' })}>
              Pass the phone
            </GameButton>
          </div>
        </div>
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

  if (step === 'role') {
    return (
      <GameShell
        title="Mafia"
        onBack={goBack}
        immersive
        footer={
          <GameButton fullWidth onClick={() => dispatch({ type: 'ROLE_NEXT' })}>
            Next
          </GameButton>
        }
      >
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center px-2">
          <RoleCard role={player.role} />
        </div>
      </GameShell>
    )
  }

  if (step === 'done') {
    let status = 'Done'
    if (player.role === 'mafia' && fullState.round.mafiaTargetId) {
      status = 'Target selected'
    } else if (player.role === 'doctor' && fullState.doctorProtectionActive) {
      status = 'Protection set'
    }
    return (
      <GameShell title="Mafia" onBack={goBack} immersive>
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
          <p className="motion-success-pop font-display text-lg font-black uppercase text-primary">{status}</p>
          <p className="mt-6 font-display text-sm font-black uppercase tracking-[0.25em] text-muted">
            Pass the phone
          </p>
          <div className="mt-10 w-full max-w-sm">
            <GameButton fullWidth haptic="medium" onClick={() => dispatch({ type: 'ACTION_DONE' })}>
              Pass
            </GameButton>
          </div>
        </div>
      </GameShell>
    )
  }

  if (step === 'detective-result') {
    return (
      <GameShell
        title="Mafia"
        onBack={goBack}
        immersive
        footer={
          <GameButton fullWidth onClick={() => dispatch({ type: 'DETECTIVE_CONTINUE' })}>
            Next
          </GameButton>
        }
      >
        <div className="game-phase-enter motion-detective-scan flex flex-1 flex-col items-center justify-center text-center px-2">
          <p className="motion-scale-in font-display text-3xl font-black uppercase detective-result-neutral">
            Not Mafia
          </p>
        </div>
      </GameShell>
    )
  }

  if (player.role === 'mafia') {
    const targets = livingPlayersExcept(fullState.players, [player.id])
    const pending = fullState.pendingMafiaTargetId ?? pick
    return (
      <GameShell title="Mafia" onBack={goBack} centerContent={false} progress={roundLabel}>
        <div className="game-phase-enter flex flex-1 flex-col gap-6 pb-4">
          <p className="font-display text-lg font-black uppercase">Choose a player</p>
          <PlayerTargetList
            players={targets}
            selectedId={pending}
            accent="mafia"
            onSelect={(id) => {
              setPick(id)
              dispatch({ type: 'MAFIA_SELECT', targetId: id })
            }}
          />
          <GameButton
            fullWidth
            variant="danger"
            disabled={!pending}
            haptic="medium"
            onClick={() => {
              playFeedback({ haptic: 'medium', sound: 'mafia_action' })
              dispatch({ type: 'MAFIA_KILL' })
            }}
          >
            Kill
          </GameButton>
        </div>
      </GameShell>
    )
  }

  if (player.role === 'doctor') {
    if (
      fullState.doctorAlive &&
      fullState.doctorProtectionActive &&
      fullState.doctorProtectedPlayerId
    ) {
      return (
        <GameShell title="Mafia" onBack={goBack} immersive>
          <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
            <p className="font-display text-xl font-black uppercase">
              Your protection is active
            </p>
            <div className="mt-10 w-full max-w-sm">
              <GameButton fullWidth onClick={() => dispatch({ type: 'DOCTOR_SKIP_ACTIVE' })}>
                Next
              </GameButton>
            </div>
          </div>
        </GameShell>
      )
    }

    const targets = livingPlayersExcept(fullState.players, [player.id])
    return (
      <GameShell title="Mafia" onBack={goBack} centerContent={false} progress={roundLabel}>
        <div className="game-phase-enter flex flex-1 flex-col gap-6 pb-4">
          <p className="font-display text-lg font-black uppercase">Protect one player this round</p>
          <p className="text-sm text-muted">
            Living players only — protection does not bring anyone back from elimination.
          </p>
          <PlayerTargetList
            players={targets}
            selectedId={pick}
            accent="doctor"
            onSelect={setPick}
          />
          <GameButton
            fullWidth
            disabled={!pick}
            onClick={() => {
              if (!pick) return
              playFeedback({ haptic: 'medium', sound: 'doctor_save' })
              dispatch({ type: 'DOCTOR_PROTECT', targetId: pick })
            }}
          >
            Protect
          </GameButton>
        </div>
      </GameShell>
    )
  }

  if (player.role === 'detective') {
    const targets = livingPlayersExcept(fullState.players, [player.id])
    return (
      <GameShell title="Mafia" onBack={goBack} centerContent={false} progress={roundLabel}>
        <div className="game-phase-enter flex flex-1 flex-col gap-6 pb-4">
          <p className="font-display text-lg font-black uppercase">Find the Mafia</p>
          <PlayerTargetList
            players={targets}
            selectedId={pick}
            accent="detective"
            onSelect={setPick}
          />
          <GameButton
            fullWidth
            disabled={!pick}
            onClick={() => {
              if (!pick) return
              playFeedback({ haptic: 'medium', sound: 'detective_scan' })
              dispatch({ type: 'DETECTIVE_INVESTIGATE', targetId: pick })
            }}
          >
            Check
          </GameButton>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell title="Mafia" onBack={goBack} immersive>
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
        <p className="font-display text-lg font-black uppercase">Your turn</p>
        <p className="mt-2 text-sm text-muted">Tap to continue.</p>
        <div className="mt-10 w-full max-w-sm">
          <GameButton fullWidth onClick={() => dispatch({ type: 'CIVILIAN_DONE' })}>
            Done
          </GameButton>
        </div>
      </div>
    </GameShell>
  )
}
