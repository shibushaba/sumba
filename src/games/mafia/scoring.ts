import type { MafiaGameState, MafiaWinner } from './types'

export interface MafiaScorePlayer {
  display_name: string
  points: number
  role: 'mafia' | 'doctor' | 'detective' | 'civilian'
  saved_player_id: string
}

export function buildMafiaScorePayload(state: MafiaGameState): {
  winner: MafiaWinner
  rounds_played: number
  players: MafiaScorePlayer[]
  doctor_saves: number
} | null {
  if (!state.winner) return null

  const doctorSaves = state.doctorSavesCount

  const players: MafiaScorePlayer[] = state.players.map((p) => {
    let points = 0
    if (state.winner === 'mafia' && p.role === 'mafia') points = 1
    if (state.winner === 'detective' && p.role === 'detective') points = 1
    return {
      display_name: p.name,
      points,
      role: p.role,
      saved_player_id: p.id,
    }
  })

  return {
    winner: state.winner,
    rounds_played: state.roundsCompleted || state.currentRound,
    players,
    doctor_saves: doctorSaves,
  }
}
