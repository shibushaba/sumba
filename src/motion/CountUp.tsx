import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface CountUpProps {
  value: number
  className?: string
  durationMs?: number
}

export function CountUp({ value, className = '', durationMs = 400 }: CountUpProps) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    if (reduced || value === prev.current) {
      setDisplay(value)
      prev.current = value
      return
    }

    const from = prev.current
    const delta = value - from
    if (Math.abs(delta) > 12) {
      setDisplay(value)
      prev.current = value
      return
    }

    const start = performance.now()
    let frame = 0

    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - (1 - t) ** 3
      setDisplay(Math.round(from + delta * eased))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        prev.current = value
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, durationMs, reduced])

  return <span className={className}>{display}</span>
}
