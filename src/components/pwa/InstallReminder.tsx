import { useEffect, useRef } from 'react'
import { usePWAInstall } from '../../hooks/usePWAInstall'
import { useGameActivity } from '../../context/GameActivityContext'
import { useToast } from '../../context/ToastContext'

export function InstallReminder() {
  const { shouldShowReminder, install, dismiss, canInstall, clearReminder } = usePWAInstall()
  const { isGameActive } = useGameActivity()
  const { showToast } = useToast()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current || isGameActive) return
    if (!shouldShowReminder()) return
    fired.current = true
    clearReminder()
    showToast({
      title: 'Still want SUMBA on your home screen?',
      actions: canInstall
        ? [
            { label: 'Install', onClick: () => void install() },
            {
              label: 'Not now',
              onClick: () => dismiss(),
            },
          ]
        : [{ label: 'Not now', onClick: () => dismiss() }],
    })
  }, [shouldShowReminder, showToast, install, dismiss, canInstall, clearReminder, isGameActive])

  return null
}
