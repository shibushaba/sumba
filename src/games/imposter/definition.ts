import { lazy } from 'react'
import { MAX_PARTY_PLAYERS } from '../../constants/partyPlayers'
import type { GameDefinition } from '../../game-engine/core/types'
import { IMPOSTER_ENGINE_VERSION } from './engine'

const ImposterPlay = lazy(() => import('./components/Play'))

export const imposterGameDefinition: GameDefinition = {
  slug: 'imposter',
  name: 'Imposter',
  description:
    "One of you doesn't know the word. Find them before they find you.",
  icon: '🕵️',
  category: 'Social Deduction',
  minPlayers: 3,
  maxPlayers: MAX_PARTY_PLAYERS,
  createdBy: 'Shabas',
  engine: 'imposter',
  engineVersion: IMPOSTER_ENGINE_VERSION,
  accentColor: '#e63946',
  leaderboardEnabled: true,
  usesSavedPlayers: true,
  Play: ImposterPlay,
}
