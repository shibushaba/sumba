import { PlayerAuthProvider } from '../../../components/auth/PlayerAuthProvider'
import { HowToPlayGate } from '../../../components/games/HowToPlayGate'
import { MafiaGame } from '../../../components/games/mafia/MafiaGame'
import { MafiaProvider } from '../../../components/games/mafia/MafiaContext'

export default function MafiaPlay() {
  return (
    <PlayerAuthProvider>
      <HowToPlayGate gameSlug="mafia">
        <MafiaProvider>
          <MafiaGame />
        </MafiaProvider>
      </HowToPlayGate>
    </PlayerAuthProvider>
  )
}
