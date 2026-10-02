import { useEffect, useState } from 'react'

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const mq = window.matchMedia('(display-mode: standalone)')
  if (mq.matches) return true
  // iOS Safari
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function useStandalone(): boolean {
  const [standalone, setStandalone] = useState(detectStandalone)

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const onChange = () => setStandalone(detectStandalone())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return standalone
}
