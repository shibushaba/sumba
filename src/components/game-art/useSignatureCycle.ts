import { useEffect, useState } from 'react'

/**
 * Fires a boolean "on" window of `durationMs` every `intervalMs` while active.
 * Timers are cleared on pause/unmount.
 */
export function useSignatureCycle(intervalMs: number, durationMs: number, active: boolean): boolean {
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!active) {
      setOn(false)
      return
    }

    let offTimer: number | null = null
    const interval = window.setInterval(() => {
      setOn(true)
      offTimer = window.setTimeout(() => setOn(false), durationMs)
    }, intervalMs)

    return () => {
      window.clearInterval(interval)
      if (offTimer !== null) window.clearTimeout(offTimer)
    }
  }, [intervalMs, durationMs, active])

  return on
}
