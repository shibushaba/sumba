/** Persistent saved player selected for a game session */
export type SelectedPlayer = {
  id: string
  displayName: string
}

export type SavedPlayerRecord = {
  id: string
  displayName: string
  normalizedName: string
  avatarSeed: string
  isActive: boolean
  lastPlayedAt: string | null
}
