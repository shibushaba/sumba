import { useCallback } from 'react'
import { triggerHaptic, type HapticPattern } from '../lib/haptics'

export function useHaptics() {
  return useCallback((pattern: HapticPattern) => {
    triggerHaptic(pattern)
  }, [])
}
