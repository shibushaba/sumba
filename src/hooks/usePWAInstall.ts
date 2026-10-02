import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../lib/storageKeys'
import { useStandalone } from './useStandalone'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const REMINDER_MS = 30 * 60 * 1000

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function readDismissed(): boolean {
  return localStorage.getItem(STORAGE_KEYS.installDismissed) === 'true'
}

export function usePWAInstall() {
  const standalone = useStandalone()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(readDismissed)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const canPrompt =
    !standalone &&
    !dismissed &&
    (Boolean(deferred) || isIos())

  const showIosHint = canPrompt && isIos() && !deferred

  const install = useCallback(async () => {
    if (!deferred) return false
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    localStorage.setItem(STORAGE_KEYS.installPromptSeen, 'true')
    if (choice.outcome === 'accepted') {
      localStorage.removeItem(STORAGE_KEYS.installReminderAt)
      return true
    }
    return false
  }, [deferred])

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.installDismissed, 'true')
    localStorage.setItem(STORAGE_KEYS.installPromptSeen, 'true')
    localStorage.setItem(STORAGE_KEYS.installReminderAt, String(Date.now() + REMINDER_MS))
    setDismissed(true)
    setDeferred(null)
  }, [])

  const shouldShowReminder = useCallback((): boolean => {
    if (standalone || dismissed) return false
    const raw = localStorage.getItem(STORAGE_KEYS.installReminderAt)
    if (!raw) return false
    const at = Number.parseInt(raw, 10)
    return Number.isFinite(at) && Date.now() >= at
  }, [standalone, dismissed])

  const clearReminder = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.installReminderAt)
  }, [])

  return {
    canInstall: Boolean(deferred),
    canPrompt,
    showIosHint,
    install,
    dismiss,
    isStandalone: standalone,
    shouldShowReminder,
    clearReminder,
  }
}
