const PREFIX = 'game_help_seen_'

export function isGameHelpSeen(gameSlug: string): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(`${PREFIX}${gameSlug}`) === 'true'
}

export function markGameHelpSeen(gameSlug: string): void {
  localStorage.setItem(`${PREFIX}${gameSlug}`, 'true')
}

export interface GameHelpContent {
  title: string
  steps: string[]
}

export const GAME_HELP: Record<string, GameHelpContent> = {
  imposter: {
    title: 'Imposter',
    steps: [
      'Add players.',
      'Choose how many Imposters.',
      'Pass the phone and reveal your role.',
      'Discuss.',
      'Vote.',
    ],
  },
  mafia: {
    title: 'Mafia',
    steps: [
      'Add players.',
      'Roles are assigned secretly.',
      'Pass the phone each turn.',
      'Mafia eliminate. Doctor protects. Detective investigates.',
      'Win by finding Mafia or surviving three rounds.',
    ],
  },
  'who-where-what': {
    title: 'Who, Where, What',
    steps: [
      'Add players.',
      'Everyone writes who, where, and what.',
      'Pass the phone to read assigned sentences.',
    ],
  },
}
