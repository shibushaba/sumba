import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'
import { PlayerSelector } from '../../../players/PlayerSelector'
import { MAX_PLAYERS } from '../../../../game-engine/imposter/engine'
import type { SelectedPlayer } from '../../../../players/types'

export function PlayerSetupScreen() {
  const { state, dispatch } = useImposterGame()

  const selected: SelectedPlayer[] = state.setupPlayers.map((p) => ({
    id: p.savedPlayerId,
    displayName: p.displayName,
  }))

  function handleSelect(player: SelectedPlayer) {
    dispatch({
      type: 'ADD_SETUP_PLAYER',
      player: {
        savedPlayerId: player.id,
        displayName: player.displayName,
      },
    })
  }

  return (
    <GameShell
      title="Who's playing?"
      centerContent={false}
      footer={
        <GameButton
          fullWidth
          disabled={state.setupPlayers.length < 3}
          onClick={() => dispatch({ type: 'GO_TO_IMPOSTER_COUNT' })}
        >
          Continue →
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col gap-6">
        <p className="text-sm text-muted">Add everyone joining this round.</p>
        <PlayerSelector
          selected={selected}
          onSelect={handleSelect}
          maxPlayers={MAX_PLAYERS}
        />
        <ul className="space-y-2">
          {state.setupPlayers.map((player, index) => (
            <li
              key={player.savedPlayerId}
              className="flex items-center justify-between border-2 border-border bg-surface/60 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-lg font-black uppercase">
                  {player.displayName}
                </span>
                <span className="text-primary">✓</span>
              </div>
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] text-xl text-muted"
                aria-label={`Remove ${player.displayName}`}
                onClick={() => dispatch({ type: 'REMOVE_PLAYER', index })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <p className="font-display text-sm font-black uppercase text-primary">
          {state.setupPlayers.length} players
        </p>
      </div>
    </GameShell>
  )
}
