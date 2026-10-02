import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'

export function ImposterCountScreen() {
  const { state, dispatch } = useImposterGame()
  const count = state.setupPlayers.length
  const canTwo = count >= 6

  return (
    <GameShell
      title="How many imposters?"
      footer={
        <GameButton fullWidth onClick={() => dispatch({ type: 'GO_TO_PACK_SELECTION' })}>
          Continue →
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          {([1, 2] as const).map((n) => {
            const selected = state.imposterCount === n
            const disabled = n === 2 && !canTwo
            return (
              <button
                key={n}
                type="button"
                disabled={disabled}
                className={[
                  'min-h-[88px] border-2 font-display text-4xl font-black',
                  selected ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                  disabled ? 'opacity-40' : '',
                ].join(' ')}
                onClick={() => dispatch({ type: 'SET_IMPOSTER_COUNT', count: n })}
              >
                {n}
              </button>
            )
          })}
        </div>
        {!canTwo ? (
          <p className="text-sm font-bold text-primary">
            Two imposters need at least 6 players.
          </p>
        ) : null}
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="border-2 border-border p-3">
            <dt className="text-xs uppercase text-muted">Players</dt>
            <dd className="font-display text-2xl font-black">{count}</dd>
          </div>
          <div className="border-2 border-border p-3">
            <dt className="text-xs uppercase text-muted">Imposters</dt>
            <dd className="font-display text-2xl font-black">{state.imposterCount}</dd>
          </div>
        </dl>
      </div>
    </GameShell>
  )
}
