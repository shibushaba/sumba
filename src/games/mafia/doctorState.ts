import type { MafiaGameState, MafiaPlayer } from './types'

export function getDoctorPlayer(players: MafiaPlayer[]): MafiaPlayer | undefined {
  return players.find((p) => p.role === 'doctor')
}

/** Keep doctorPlayerId / doctorAlive in sync with player list. */
export function syncDoctorState(state: MafiaGameState): MafiaGameState {
  const doctor = getDoctorPlayer(state.players)
  const doctorPlayerId = doctor?.id ?? state.doctorPlayerId
  const doctorAlive = doctor ? doctor.alive : false
  return {
    ...state,
    doctorPlayerId,
    doctorAlive,
  }
}

export function canDoctorAct(state: MafiaGameState): boolean {
  if (!state.doctorPlayerId || !state.doctorAlive) return false
  const doctor = state.players.find((p) => p.id === state.doctorPlayerId)
  return Boolean(doctor?.alive)
}

/**
 * Living Doctor chooses a new protect target each round.
 * If the Doctor is eliminated, an unused shield may still protect someone once.
 */
export function doctorProtectionForNewRound(state: MafiaGameState): {
  doctorProtectedPlayerId: string | null
  doctorProtectionActive: boolean
} {
  if (state.doctorAlive) {
    return { doctorProtectedPlayerId: null, doctorProtectionActive: false }
  }
  return {
    doctorProtectedPlayerId: state.doctorProtectedPlayerId,
    doctorProtectionActive: state.doctorProtectionActive,
  }
}
