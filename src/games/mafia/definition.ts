import { lazy } from 'react'
import { MAX_PARTY_PLAYERS } from '../../constants/partyPlayers'
import type { GameDefinition } from '../../game-engine/core/types'
import { MAFIA_ENGINE_VERSION } from './engine'
import { GAME_SLUG } from './constants'

const MafiaPlay = lazy(() => import('./components/Play'))

export const mafiaGameDefinition: GameDefinition = {
  slug: GAME_SLUG,
  name: 'Mafia',
  description: 'Find the Mafia before they survive three rounds.',
  icon: '🌙',
  category: 'Party',
  minPlayers: 5,
  maxPlayers: MAX_PARTY_PLAYERS,
  createdBy: 'SUMBA',
  engine: 'mafia',
  engineVersion: MAFIA_ENGINE_VERSION,
  accentColor: '#8b1e2d',
  leaderboardEnabled: true,
  usesSavedPlayers: true,
  Play: MafiaPlay,
}
