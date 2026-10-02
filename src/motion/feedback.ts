import { triggerHaptic, type HapticPattern } from '../lib/haptics'
import { playSound, type SoundEvent } from '../lib/sound'

export type FeedbackHaptic =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'selection'
  | 'warning'

const hapticMap: Record<FeedbackHaptic, HapticPattern> = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  error: 'warning',
  selection: 'light',
  warning: 'warning',
}

export type FeedbackSound =
  | 'button_press'
  | 'success'
  | 'error'
  | 'role_reveal'
  | 'mafia_action'
  | 'detective_scan'
  | 'doctor_save'
  | 'game_win'
  | 'game_over'
  | 'leaderboard_update'
  | 'transition'

const soundMap: Record<FeedbackSound, SoundEvent> = {
  button_press: 'button',
  success: 'success',
  error: 'failure',
  role_reveal: 'reveal',
  mafia_action: 'imposter',
  detective_scan: 'vote',
  doctor_save: 'transition',
  game_win: 'success',
  game_over: 'failure',
  leaderboard_update: 'transition',
  transition: 'transition',
}

export function playFeedback(options: {
  haptic?: FeedbackHaptic
  sound?: FeedbackSound
}): void {
  if (options.haptic) triggerHaptic(hapticMap[options.haptic])
  if (options.sound) playSound(soundMap[options.sound])
}
