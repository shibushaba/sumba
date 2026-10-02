import { useCallback, useEffect, useState } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const supported =
    typeof document !== 'undefined' && document.documentElement.requestFullscreen != null

  const toggle = useCallback(async () => {
    if (!supported) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // User denied or unsupported
    }
  }, [supported])

  return { isFullscreen, supported, toggle }
}
