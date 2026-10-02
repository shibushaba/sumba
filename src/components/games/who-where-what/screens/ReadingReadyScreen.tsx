import { useState } from 'react'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { useWhoWhereWhat } from '../WhoWhereWhatContext'
import { WwwShuffleIntro } from '../WwwShuffleIntro'

export function ReadingReadyScreen() {
  const { dispatch, goBack } = useWhoWhereWhat()
  const [introDone, setIntroDone] = useState(false)

  if (!introDone) {
    return (
      <GameShell title="Who, Where, What" onBack={goBack} immersive>
        <WwwShuffleIntro onComplete={() => setIntroDone(true)} />
      </GameShell>
    )
  }

  return (
    <GameShell title="Who, Where, What" onBack={goBack}>
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
        <p className="font-display text-2xl font-black uppercase">The stories are ready</p>
        <p className="mt-4 max-w-sm text-sm text-muted">
          Now let&apos;s see what everyone created.
        </p>
        <p className="mt-2 max-w-sm text-xs text-muted">
          You&apos;ll each read one sentence aloud — in private.
        </p>
        <div className="mt-10 w-full max-w-sm">
          <GameButton fullWidth haptic="medium" onClick={() => dispatch({ type: 'START_READING' })}>
            Start
          </GameButton>
        </div>
      </div>
    </GameShell>
  )
}
