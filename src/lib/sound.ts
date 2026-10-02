import { isSoundEnabled } from './preferences'

export type SoundEvent =
  | 'button'
  | 'reveal'
  | 'imposter'
  | 'vote'
  | 'success'
  | 'failure'
  | 'transition'

let unlocked = false

export function unlockAudio(): void {
  unlocked = true
}

function playTone(frequency: number, durationMs: number, volume = 0.08): void {
  if (!isSoundEnabled() || !unlocked) return
  if (typeof window === 'undefined') return

  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.value = volume
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + durationMs / 1000)
    oscillator.onended = () => {
      ctx.close().catch(() => undefined)
    }
  } catch {
    // no audio
  }
}

const eventTones: Record<SoundEvent, [number, number]> = {
  button: [440, 60],
  reveal: [523, 90],
  imposter: [180, 140],
  vote: [330, 80],
  success: [660, 120],
  failure: [220, 160],
  transition: [392, 70],
}

export function playSound(event: SoundEvent): void {
  const [freq, duration] = eventTones[event]
  playTone(freq, duration)
}
