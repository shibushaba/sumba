import { useNavigate } from 'react-router-dom'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { useWhoWhereWhat } from '../WhoWhereWhatContext'

export function CompleteScreen() {
  const { dispatch, goBack } = useWhoWhereWhat()
  const navigate = useNavigate()

  return (
    <GameShell title="Who, Where, What" onBack={goBack}>
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-[clamp(2rem,10vw,3rem)] font-black uppercase">
          That&apos;s it
        </p>
        <p className="mt-3 text-sm text-muted">Everyone has their sentence.</p>
        <div className="mt-10 w-full max-w-sm space-y-3">
          <GameButton fullWidth onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>
            Play again
          </GameButton>
          <GameButton
            variant="secondary"
            fullWidth
            onClick={() => navigate('/games')}
          >
            Back to games
          </GameButton>
        </div>
      </div>
    </GameShell>
  )
}
