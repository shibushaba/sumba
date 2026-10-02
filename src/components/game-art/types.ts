export type GameArtId = 'imposter' | 'mafia' | 'who-where-what'

export function parseGameArtSlug(slug: string): GameArtId | null {
  if (slug === 'imposter' || slug === 'mafia' || slug === 'who-where-what') return slug
  return null
}

export const GAME_ART_COLORS = {
  imposter: { primary: '#39A8FF', secondary: '#1687E8', highlight: '#8AD8FF' },
  mafia: { primary: '#FF304F', secondary: '#C41435', highlight: '#FF6B78' },
  'who-where-what': { primary: '#45D889', secondary: '#159A58', highlight: '#9AFFC7' },
} as const
