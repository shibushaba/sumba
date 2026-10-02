export function createPlayerId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export function createSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `g_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
