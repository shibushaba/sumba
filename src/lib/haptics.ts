import { isHapticsEnabled } from './preferences'

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning'

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 45,
  success: [15, 40, 25],
  warning: [30, 20, 40],
}

export function triggerHaptic(pattern: HapticPattern): void {
  if (!isHapticsEnabled()) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return
  }
  try {
    navigator.vibrate(patterns[pattern])
  } catch {
    // unsupported
  }
}
