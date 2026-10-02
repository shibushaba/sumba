import { pickWordFromPool } from '../../game-engine/imposter/engine'
import type { ImposterSetupState } from '../../game-engine/imposter/types'
import { malayalamWords } from './data/malayalamWords'
import { randomWords } from './data/randomWords'
import { drawSpecialPackWord } from '../../services/imposterPacks'

export async function resolveSecretWord(state: ImposterSetupState): Promise<string> {
  const recent = state.round?.recentWords ?? []
  if (state.packChoice === 'malayalam') {
    return pickWordFromPool(malayalamWords, recent)
  }
  if (state.packChoice === 'special' && state.specialPackId) {
    const word = await drawSpecialPackWord(state.specialPackId)
    if (word) return word
    throw new Error('Could not load special pack word.')
  }
  return pickWordFromPool(randomWords, recent)
}
