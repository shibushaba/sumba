import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { useMafia } from '../MafiaContext'

export function SetupScreen() {
  const { dispatch, goBack } = useMafia()

  return (
    <GameShell title="Mafia" onBack={goBack}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="motion-scale-in font-display text-4xl font-bold uppercase leading-tight role-reveal-mafia">
          Mafia
        </p>
        <div className="mt-10 w-full max-w-sm motion-slide-up motion-stagger-2">
          <GameButton fullWidth haptic="medium" onClick={() => dispatch({ type: 'START_PLAYERS' })}>
            Start game
          </GameButton>
        </div>
      </div>
    </GameShell>
  )
}
