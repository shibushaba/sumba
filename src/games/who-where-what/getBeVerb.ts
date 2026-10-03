/** WHO + WHERE + WHAT, read aloud as three words (no “was” / grammar). */
export function formatSentence(who: string, what: string, where: string): string {
  const whoPart = who.trim()
  const wherePart = where.trim()
  const whatPart = what.trim()
  return [whoPart, wherePart, whatPart].filter(Boolean).join(' ')
}
