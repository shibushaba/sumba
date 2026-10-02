import type { GamePlayer, GameSession, GameSessionStatus } from './types'

export function createGameSession<TState>(input: {
  gameSlug: string
  players: GamePlayer[]
  phase: string
  round: number
  state: TState
  status?: GameSessionStatus
}): GameSession<TState> {
  return {
    sessionId: crypto.randomUUID(),
    gameSlug: input.gameSlug,
    players: input.players,
    phase: input.phase,
    round: input.round,
    startedAt: input.status === 'active' ? new Date().toISOString() : null,
    status: input.status ?? 'idle',
    state: input.state,
  }
}
