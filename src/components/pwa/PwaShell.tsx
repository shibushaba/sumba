import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '../../lib/storageKeys'
import { InstallPrompt } from './InstallPrompt'
import { InstallReminder } from './InstallReminder'
import { OfflineIndicator } from './OfflineIndicator'
import { PwaUpdateBanner } from './PwaUpdateBanner'

export function PwaShell({ children }: { children: ReactNode }) {
  const location = useLocation()

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.installInteractions)
    const count = raw ? Number.parseInt(raw, 10) || 0 : 0
    localStorage.setItem(STORAGE_KEYS.installInteractions, String(count + 1))
  }, [location.pathname])

  return (
    <>
      <OfflineIndicator />
      <PwaUpdateBanner />
      {children}
      <InstallPrompt />
      <InstallReminder />
    </>
  )
}
