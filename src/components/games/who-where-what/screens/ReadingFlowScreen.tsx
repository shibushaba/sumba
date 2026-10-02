import { PassPhoneScreen } from '../../PassPhoneScreen'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { useWhoWhereWhat } from '../WhoWhereWhatContext'

export function ReadingFlowScreen() {
  const {
    state,
    dispatch,
    currentReadingPlayerName,
    currentAssignedSentence,
    goBack,
  } = useWhoWhereWhat()

  const step = state.readingStep
  const index = state.currentReadingPlayerIndex
  const total = state.players.length
  const playerName = currentReadingPlayerName ?? 'Player'
  const firstName = playerName.split(' ')[0]

  if (step === 'announce') {
    return (
      <GameShell title="Who, Where, What" onBack={goBack} progress={`${index + 1}/${total}`}>
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
          <p className="font-display text-[clamp(1.75rem,8vw,2.75rem)] font-black uppercase leading-tight">
            {firstName}&apos;s turn
          </p>
          <div className="mt-10 w-full max-w-sm">
            <GameButton
              fullWidth
              onClick={() => dispatch({ type: 'READING_ANNOUNCE_CONTINUE' })}
            >
              Continue
            </GameButton>
          </div>
        </div>
      </GameShell>
    )
  }

  if (step === 'pass') {
    return (
      <GameShell title="Who, Where, What" onBack={goBack} immersive>
        <PassPhoneScreen
          playerName={playerName}
          currentIndex={index + 1}
          totalPlayers={total}
          onReady={() => dispatch({ type: 'READING_PASS_ACK' })}
        />
      </GameShell>
    )
  }

  if (step === 'pass-out') {
    return (
      <GameShell title="Who, Where, What" onBack={goBack} immersive>
        <div className="game-phase-enter game-no-select flex flex-1 flex-col items-center justify-center px-2 text-center">
          <p className="font-display text-sm font-black uppercase tracking-[0.3em] text-muted">
            Pass the phone
          </p>
          <div className="mt-12 w-full max-w-sm pb-safe-inline">
            <GameButton
              fullWidth
              haptic="medium"
              onClick={() => dispatch({ type: 'READING_PASS_OUT_ACK' })}
            >
              Pass
            </GameButton>
          </div>
        </div>
      </GameShell>
    )
  }

  const sentence = currentAssignedSentence ?? ''

  return (
    <GameShell
      title="Who, Where, What"
      onBack={goBack}
      immersive
      footer={
        <GameButton fullWidth haptic="medium" onClick={() => dispatch({ type: 'READING_HIDE_PASS' })}>
          Hide &amp; pass
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center px-2 text-center">
        <p className="www-sentence-label font-display text-xs font-black uppercase tracking-[0.25em] text-muted">
          Your sentence
        </p>
        <div
          key={`${index}-${sentence}`}
          className="www-sentence-reveal motion-reveal-blur mt-8 w-full max-w-md border-2 border-foreground bg-surface/80 px-4 py-8"
        >
          <p className="font-display text-[clamp(1.25rem,5.5vw,1.75rem)] font-black uppercase leading-snug break-words">
            {sentence}
          </p>
        </div>
        <p className="mt-8 text-sm font-bold uppercase text-primary">
          Read it out loud
        </p>
      </div>
    </GameShell>
  )
}
