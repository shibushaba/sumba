import { STORAGE_KEYS } from './storageKeys'

const STORAGE_KEY = STORAGE_KEYS.deviceId

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
