import { triggerHaptic } from '../../../../lib/haptics'
import { playSound } from '../../../../lib/sound'
import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { PassPhoneScreen } from '../../PassPhoneScreen'
import { VotingCard } from '../VotingCard'
import { GameButton } from '../GameButton'

export function VotingScreen() {
  const { state, dispatch } = useImposterGame()
  const round = state.round
  if (!round) return null

  const { votingIndex, votingStep, players, votes } = round
  const voter = players[votingIndex]

  if (votingStep === 'all-done') {
    return (
      <GameShell immersive>
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-3xl font-black uppercase">Everyone has voted.</p>
          <div className="mt-10 w-full max-w-sm">
            <GameButton
              fullWidth
              onClick={() => dispatch({ type: 'VOTES_COMPLETE_CONTINUE' })}
            >
              Continue
            </GameButton>
          </div>
        </div>
      </GameShell>
    )
  }

  if (votingStep === 'pass') {
    return (
      <GameShell immersive>
        <PassPhoneScreen
          context="vote"
          playerName={voter.name}
          currentIndex={votingIndex + 1}
          totalPlayers={players.length}
          onReady={() => dispatch({ type: 'VOTE_PASS' })}
        />
      </GameShell>
    )
  }

  if (votingStep === 'locked') {
    return (
      <GameShell immersive>
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-2xl font-black uppercase">Vote locked</p>
          <p className="mt-4 text-sm text-muted">Pass the phone</p>
          <div className="mt-10 w-full max-w-sm">
            <GameButton fullWidth onClick={() => dispatch({ type: 'VOTE_PASS' })}>
              Continue
            </GameButton>
          </div>
        </div>
      </GameShell>
    )
  }

  const hasSelection = Boolean(round.draftTargetId)

  return (
    <GameShell
      immersive
      footer={
        <GameButton
          fullWidth
          disabled={!hasSelection}
          haptic="medium"
          onClick={() => {
            triggerHaptic('medium')
            playSound('vote')
            dispatch({ type: 'VOTE_LOCK' })
          }}
        >
          Lock vote
        </GameButton>
      }
    >
      <div className="game-phase-enter">
        <h1 className="font-display text-2xl font-black uppercase">{voter.name}&apos;s vote</h1>
        <p className="mt-2 text-sm text-muted">Who is the Imposter?</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {players.map((player, index) => (
            <VotingCard
              key={player.id}
              index={index}
              name={player.name}
              selected={round.draftTargetId === player.id}
              disabled={player.id === voter.id}
              onSelect={() => dispatch({ type: 'VOTE_SELECT', targetId: player.id })}
            />
          ))}
        </div>
        {round.voteError ? (
          <p className="mt-3 text-sm font-bold text-primary" role="alert">{round.voteError}</p>
        ) : null}
        <p className="sr-only">{votes.length} votes locked so far.</p>
      </div>
    </GameShell>
  )
}
