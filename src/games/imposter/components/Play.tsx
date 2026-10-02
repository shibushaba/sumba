import { PlayerAuthProvider } from '../../../components/auth/PlayerAuthProvider'
import { HowToPlayGate } from '../../../components/games/HowToPlayGate'
import { ImposterGame } from '../../../components/games/imposter/ImposterGame'
import { ImposterGameProvider } from '../../../components/games/imposter/ImposterGameContext'

export default function ImposterPlay() {
  return (
    <PlayerAuthProvider>
      <HowToPlayGate gameSlug="imposter">
        <ImposterGameProvider>
          <ImposterGame />
        </ImposterGameProvider>
      </HowToPlayGate>
    </PlayerAuthProvider>
  )
}
