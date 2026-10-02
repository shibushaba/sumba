import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitGameRating } from '../../../../services/ratings'
import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { StarRating } from '../StarRating'
import { GameButton } from '../GameButton'

type ViewState = 'form' | 'submitting' | 'thanks' | 'error'

export function RatingScreen() {
  const { dispatch } = useImposterGame()
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [view, setView] = useState<ViewState>('form')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (rating < 1) {
      setError('Pick a star rating first.')
      return
    }
    setView('submitting')
    setError(null)
    const result = await submitGameRating({
      gameSlug: 'imposter',
      rating,
      feedback,
    })
    if (!result.ok) {
      setView('error')
      setError(
        result.duplicate
          ? "You've already rated this game."
          : result.offline
            ? "Couldn't send your rating."
            : result.error,
      )
      return
    }
    setView('thanks')
  }

  if (view === 'thanks') {
    return (
      <GameShell immersive title="Thanks">
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-3xl font-black uppercase">Thanks for playing ❤️</p>
          <p className="mt-4 max-w-xs text-sm text-muted">
            Your rating helps us make SUMBA better.
          </p>
          <Link
            to="/games"
            className="mt-10 block w-full max-w-sm"
            onClick={() => dispatch({ type: 'END_GAME' })}
          >
            <GameButton fullWidth variant="secondary" sound={false}>
              Back to games
            </GameButton>
          </Link>
        </div>
      </GameShell>
    )
  }

  if (view === 'submitting') {
    return (
      <GameShell immersive title="Rating">
        <p className="text-center text-sm text-muted">Submitting...</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      immersive
      title="Rating"
      footer={
        view === 'form' || view === 'error' ? (
          <>
            <GameButton fullWidth onClick={handleSubmit}>
              Submit
            </GameButton>
            <Link
              to="/games"
              className="block"
              onClick={() => dispatch({ type: 'END_GAME' })}
            >
              <GameButton variant="secondary" fullWidth sound={false}>
                Skip
              </GameButton>
            </Link>
          </>
        ) : null
      }
    >
      <div className="game-phase-enter">
        <h1 className="font-display text-3xl font-black uppercase">How was that?</h1>
      </div>
      <StarRating value={rating} onChange={setRating} />
      <label className="mt-8 block text-xs font-bold uppercase text-muted" htmlFor="feedback">
        Anything to say?
      </label>
      <textarea
        id="feedback"
        rows={4}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="mt-2 w-full min-h-[100px] border-2 border-border bg-surface px-3 py-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        placeholder="Optional feedback"
      />
      {view === 'error' && error ? (
        <div className="mt-4 space-y-2" role="alert">
          <p className="text-sm font-bold text-primary">{error}</p>
          {error.includes("Couldn't") ? (
            <p className="text-sm text-muted">Your game is still safe.</p>
          ) : null}
          {error.includes("Couldn't") ? (
            <GameButton variant="secondary" fullWidth onClick={handleSubmit}>
              Try again
            </GameButton>
          ) : null}
        </div>
      ) : null}
      {view === 'form' && error ? (
        <p className="mt-3 text-sm text-primary" role="alert">{error}</p>
      ) : null}
    </GameShell>
  )
}
