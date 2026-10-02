import { useEffect, useState } from 'react'
import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'
import { fetchAccessibleSpecialPacks, type SpecialPackSummary } from '../../../../services/imposterPacks'
import { resolveSecretWord } from '../../../../games/imposter/wordService'
import { usePlayerAuth } from '../../../auth/PlayerAuthProvider'

export function PackSelectionScreen() {
  const { state, dispatch } = useImposterGame()
  const { user } = usePlayerAuth()
  const [specialPacks, setSpecialPacks] = useState<SpecialPackSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    void fetchAccessibleSpecialPacks().then(setSpecialPacks)
  }, [user])

  async function startRound() {
    setLoading(true)
    setError(null)
    try {
      const word = await resolveSecretWord(state)
      dispatch({ type: 'START_ROUND', secretWord: word })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start round.')
    } finally {
      setLoading(false)
    }
  }

  function selectPack(
    choice: 'random' | 'malayalam' | 'special',
    special?: SpecialPackSummary,
  ) {
    dispatch({
      type: 'SET_PACK',
      choice,
      specialPackId: special?.id ?? null,
      specialPackLabel: special?.name ?? null,
    })
  }

  const selected = state.packChoice

  return (
    <GameShell
      title="Choose your pack"
      centerContent={false}
      footer={
        <GameButton fullWidth disabled={loading} haptic="medium" onClick={() => void startRound()}>
          Start round
        </GameButton>
      }
    >
      <div className="game-phase-enter space-y-3">
        <PackCard
          title="Random"
          description="Anything can appear."
          active={selected === 'random'}
          onClick={() => selectPack('random')}
        />
        <PackCard
          title="Malayalam"
          description="Simple Malayalam words everyone knows."
          active={selected === 'malayalam'}
          onClick={() => selectPack('malayalam')}
        />
        <div className="border-2 border-border p-4">
          <p className="font-display text-lg font-black uppercase">Special pack</p>
          {specialPacks.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {specialPacks.map((pack) => (
                <li key={pack.id}>
                  <button
                    type="button"
                    className={[
                      'w-full border-2 px-3 py-3 text-left',
                      selected === 'special' && state.specialPackId === pack.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border',
                    ].join(' ')}
                    onClick={() => selectPack('special', pack)}
                  >
                    <span className="font-display font-black uppercase">{pack.name}</span>
                    {pack.description ? (
                      <span className="mt-1 block text-sm text-muted">{pack.description}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Special packs are available to selected SUMBA players.
            </p>
          )}
        </div>
        {error ? <p className="text-sm font-bold text-primary" role="alert">{error}</p> : null}
      </div>
    </GameShell>
  )
}

function PackCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={[
        'w-full border-2 p-4 text-left',
        active ? 'border-primary bg-primary/10' : 'border-border',
      ].join(' ')}
      onClick={onClick}
    >
      <p className="font-display text-xl font-black uppercase">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </button>
  )
}
