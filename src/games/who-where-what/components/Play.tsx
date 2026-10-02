import { PlayerAuthProvider } from '../../../components/auth/PlayerAuthProvider'
import { HowToPlayGate } from '../../../components/games/HowToPlayGate'
import { WhoWhereWhatGame } from '../../../components/games/who-where-what/WhoWhereWhatGame'
import { WhoWhereWhatProvider } from '../../../components/games/who-where-what/WhoWhereWhatContext'

export default function WhoWhereWhatPlay() {
  return (
    <PlayerAuthProvider>
      <HowToPlayGate gameSlug="who-where-what">
        <WhoWhereWhatProvider>
          <WhoWhereWhatGame />
        </WhoWhereWhatProvider>
      </HowToPlayGate>
    </PlayerAuthProvider>
  )
}
