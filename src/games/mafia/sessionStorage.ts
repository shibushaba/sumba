import { syncDoctorState } from './doctorState'
import { createInitialMafiaState } from './reducer'
import type { MafiaGameState } from './types'

const STORAGE_KEY = 'sumba_mafia_session_v1'

export function loadMafiaSession(): MafiaGameState | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MafiaGameState
    return syncDoctorState({
      ...createInitialMafiaState(),
      ...parsed,
      doctorPlayerId: parsed.doctorPlayerId ?? null,
      doctorAlive: parsed.doctorAlive ?? false,
      winReason: parsed.winReason ?? null,
      revealOrder: parsed.revealOrder ?? [],
      revealIndex: parsed.revealIndex ?? 0,
      roleRevealStep: parsed.roleRevealStep ?? 'pass',
    })
  } catch {
    return null
  }
}

export function saveMafiaSession(state: MafiaGameState): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota / private mode
  }
}

export function clearMafiaSession(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(STORAGE_KEY)
}
