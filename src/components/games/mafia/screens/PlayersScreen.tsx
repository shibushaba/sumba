import { MIN_PLAYERS, MAX_PLAYERS } from '../../../../games/mafia/constants'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { PlayerSelector } from '../../../players/PlayerSelector'
import { useMafia } from '../MafiaContext'
import type { SelectedPlayer } from '../../../../players/types'

export function PlayersScreen() {
  const { state, dispatch, addPlayer, removePlayer, goBack } = useMafia()

  const selected: SelectedPlayer[] = state.players.map((p) => ({
    id: p.id,
    displayName: p.name,
  }))

  return (
    <GameShell
      title="Mafia"
      centerContent={false}
      onBack={goBack}
      footer={
        <GameButton
          fullWidth
          disabled={state.players.length < MIN_PLAYERS}
          onClick={() => dispatch({ type: 'BEGIN_ROLE_ASSIGNMENT' })}
        >
          Continue →
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col gap-6">
        <h2 className="font-display text-xl font-black uppercase">Who&apos;s playing?</h2>
        <p className="text-sm text-muted">{MIN_PLAYERS}–{MAX_PLAYERS} players.</p>
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
              <span className="font-display text-lg font-black uppercase">
                {player.name}
              </span>
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
      </div>
    </GameShell>
  )
}
