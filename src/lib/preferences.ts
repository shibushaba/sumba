import { STORAGE_KEYS } from './storageKeys'

const SOUND_KEY = STORAGE_KEYS.sound
const HAPTICS_KEY = STORAGE_KEYS.haptics

function readFlag(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue
  const raw = localStorage.getItem(key)
  if (raw === null) return defaultValue
  return raw === 'true'
}

export function isSoundEnabled(): boolean {
  return readFlag(SOUND_KEY, true)
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_KEY, String(enabled))
}

export function isHapticsEnabled(): boolean {
  return readFlag(HAPTICS_KEY, true)
}

export function setHapticsEnabled(enabled: boolean): void {
  localStorage.setItem(HAPTICS_KEY, String(enabled))
}
