import { useCallback } from 'react'
import { playSound, unlockAudio, type SoundEvent } from '../lib/sound'

export function useSound() {
  const play = useCallback((event: SoundEvent) => {
    playSound(event)
  }, [])

  const unlock = useCallback(() => {
    unlockAudio()
  }, [])

  return { play, unlock }
}
