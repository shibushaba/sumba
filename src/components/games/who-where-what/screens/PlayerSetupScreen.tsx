import { MIN_PLAYERS, MAX_PLAYERS } from '../../../../games/who-where-what/constants'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { PlayerSelector } from '../../../players/PlayerSelector'
import { useWhoWhereWhat } from '../WhoWhereWhatContext'
import type { SelectedPlayer } from '../../../../players/types'

export function PlayerSetupScreen() {
  const { state, dispatch, addPlayer, removePlayer, goBack } = useWhoWhereWhat()

  const selected: SelectedPlayer[] = state.players.map((p) => ({
    id: p.id,
    displayName: p.name,
  }))

  return (
    <GameShell
      title="Who, Where, What"
      centerContent={false}
      onBack={goBack}
      footer={
        <GameButton
          fullWidth
          disabled={state.players.length < MIN_PLAYERS}
          onClick={() => dispatch({ type: 'START_WRITING' })}
        >
          Continue →
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col gap-6">
        <div className="text-center">
          <p className="font-display text-4xl font-black uppercase leading-none text-primary">
            Who
          </p>
          <p className="font-display text-4xl font-black uppercase leading-none">Where</p>
          <p className="font-display text-4xl font-black uppercase leading-none text-primary">
            What
          </p>
        </div>
        <h2 className="font-display text-xl font-black uppercase">Who&apos;s playing?</h2>
        <p className="text-sm text-muted">
          {MIN_PLAYERS}–{MAX_PLAYERS} players. Add everyone joining this round.
        </p>
        <PlayerSelector
          selected={selected}
          onSelect={(player) => addPlayer(player)}
          maxPlayers={MAX_PLAYERS}
        />
        <ul className="space-y-2">
          {state.players.map((player, index) => (
            <li
              key={player.id}
              className="flex items-center justify-between gap-2 border-2 border-border bg-surface/60 px-3 py-2"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="font-display text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="truncate font-display text-lg font-black uppercase">
                  {player.name}
                </span>
              </div>
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] text-xl text-muted"
                aria-label={`Remove ${player.name}`}
                onClick={() => removePlayer(index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <p className="font-display text-sm font-black uppercase text-primary">
          {state.players.length} players
        </p>
      </div>
    </GameShell>
  )
}
