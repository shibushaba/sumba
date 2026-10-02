import { useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export function OfflineIndicator() {
  const online = useOnlineStatus()
  const [message, setMessage] = useState<'offline' | 'online' | null>(null)
  const wasOnline = useRef(online)

  useEffect(() => {
    if (!online) {
      setMessage('offline')
      wasOnline.current = false
      return
    }

    if (!wasOnline.current) {
      setMessage('online')
      const timer = window.setTimeout(() => setMessage(null), 2800)
      wasOnline.current = true
      return () => clearTimeout(timer)
    }

    setMessage(null)
  }, [online])

  if (!message) return null

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[60] px-4 pt-[max(0.5rem,env(safe-area-inset-top))]"
      role="status"
      aria-live="polite"
    >
      <div
        className={[
          'mx-auto max-w-lg border-2 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider',
          'pwa-toast-enter',
          message === 'offline'
            ? 'border-primary bg-[#1a1012] text-primary'
            : 'border-foreground bg-surface text-foreground',
        ].join(' ')}
      >
        {message === 'offline' ? (
          <>
            <span>Offline</span>
            <span className="mt-0.5 block font-normal normal-case tracking-normal text-muted">
              Game mode still works.
            </span>
          </>
        ) : (
          <span>Back online</span>
        )}
      </div>
    </div>
  )
}
