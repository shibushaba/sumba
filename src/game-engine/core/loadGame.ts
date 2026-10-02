import { getGame, hasGame } from './GameRegistry'
import type { GameDefinition } from './types'

export interface LoadedGame {
  definition: GameDefinition
  installed: boolean
}

export function loadGame(slug: string): LoadedGame | null {
  const definition = getGame(slug)
  if (!definition) {
    return null
  }
  return {
    definition,
    installed: hasGame(slug),
  }
}
