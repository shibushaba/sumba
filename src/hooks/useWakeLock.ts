import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return
    }

    let cancelled = false

    async function acquire() {
      try {
        if (document.visibilityState !== 'visible') return
        sentinelRef.current = await navigator.wakeLock.request('screen')
        sentinelRef.current?.addEventListener('release', () => {
          sentinelRef.current = null
        })
      } catch {
        // Unsupported or denied — ignore
      }
    }

    void acquire()

    const onVisibility = () => {
      if (cancelled) return
      if (document.visibilityState === 'visible' && active) {
        void acquire()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinelRef.current?.release()
      sentinelRef.current = null
    }
  }, [active])
}
