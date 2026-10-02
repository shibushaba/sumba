export interface GamePlayer {
  id: string
  displayName: string
  isHost?: boolean
}

export interface GameSession<TConfig = unknown, TState extends GameState = GameState> {
  id: string
  gameId: string
  players: GamePlayer[]
  config: TConfig
  state: TState
  createdAt: string
}

export interface GameState {
  phase: string
  startedAt?: string
  endedAt?: string
}

export interface GameDefinitionMeta {
  id: string
  name: string
  minPlayers: number
  maxPlayers: number
}
