export interface ResolveRoundInput {
  mafiaTargetId: string | null
  doctorProtectedPlayerId: string | null
  doctorProtectionActive: boolean
}

export interface ResolveRoundResult {
  eliminatedPlayerId: string | null
  savedPlayerId: string | null
  doctorProtectedPlayerId: string | null
  doctorProtectionActive: boolean
}

/**
 * Resolves the Mafia kill against active Doctor protection.
 */
export function resolveRound(input: ResolveRoundInput): ResolveRoundResult {
  const { mafiaTargetId, doctorProtectedPlayerId, doctorProtectionActive } = input

  if (!mafiaTargetId) {
    return {
      eliminatedPlayerId: null,
      savedPlayerId: null,
      doctorProtectedPlayerId,
      doctorProtectionActive,
    }
  }

  if (
    doctorProtectionActive &&
    doctorProtectedPlayerId &&
    doctorProtectedPlayerId === mafiaTargetId
  ) {
    return {
      eliminatedPlayerId: null,
      savedPlayerId: mafiaTargetId,
      doctorProtectedPlayerId: null,
      doctorProtectionActive: false,
    }
  }

  return {
    eliminatedPlayerId: mafiaTargetId,
    savedPlayerId: null,
    doctorProtectedPlayerId,
    doctorProtectionActive,
  }
}
