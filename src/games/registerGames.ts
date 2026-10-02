import { registerGame } from '../game-engine/core/GameRegistry'
import { imposterGameDefinition } from './imposter/definition'
import { whoWhereWhatGameDefinition } from './who-where-what/definition'
import { mafiaGameDefinition } from './mafia/definition'

let registered = false

export function ensureGamesRegistered(): void {
  if (registered) return
  registerGame(imposterGameDefinition)
  registerGame(whoWhereWhatGameDefinition)
  registerGame(mafiaGameDefinition)
  registered = true
}
