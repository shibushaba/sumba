export const MAX_PLAYER_NAME_LENGTH = 30

export function normalizePlayerName(raw: string): string {
  return raw.trim().toLowerCase()
}

export function formatPlayerDisplayName(raw: string): string {
  return raw.trim().slice(0, MAX_PLAYER_NAME_LENGTH)
}

export function isValidPlayerDisplayName(raw: string): boolean {
  const name = formatPlayerDisplayName(raw)
  return name.length >= 1 && name.length <= MAX_PLAYER_NAME_LENGTH
}
