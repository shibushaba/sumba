import { lazy } from 'react'
import { MAX_PARTY_PLAYERS } from '../../constants/partyPlayers'
import type { GameDefinition } from '../../game-engine/core/types'
import { WHO_WHERE_WHAT_ENGINE_VERSION } from './engine'
import { GAME_SLUG } from './constants'

const WhoWhereWhatPlay = lazy(() => import('./components/Play'))

export const whoWhereWhatGameDefinition: GameDefinition = {
  slug: GAME_SLUG,
  name: 'Who, Where, What',
  description: 'Write three things. Pass the phone. Discover the chaos.',
  icon: '📝',
  category: 'Party',
  minPlayers: 3,
  maxPlayers: MAX_PARTY_PLAYERS,
  createdBy: 'SUMBA',
  engine: 'who-where-what',
  engineVersion: WHO_WHERE_WHAT_ENGINE_VERSION,
  accentColor: '#e63946',
  leaderboardEnabled: false,
  usesSavedPlayers: true,
  Play: WhoWhereWhatPlay,
}
