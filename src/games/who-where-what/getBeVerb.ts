/**
 * Picks was/were for final sentence grammar. Defaults to "was" when uncertain.
 */
export function getBeVerb(who: string): 'was' | 'were' {
  const trimmed = who.trim()
  const lower = trimmed.toLowerCase()

  if (lower === 'everyone' || lower === 'everybody') {
    return 'was'
  }

  if (
    /^the (boys|girls|cousins|kids|children|friends|neighbors|students|players|guys|gals)\b/.test(
      lower,
    )
  ) {
    return 'were'
  }

  if (/^(boys|girls|cousins|kids|children|friends|they|we)\b/.test(lower)) {
    return 'were'
  }

  return 'was'
}

export function formatSentence(who: string, what: string, where: string): string {
  const whoPart = who.trim()
  const whatPart = what.trim()
  const wherePart = where.trim()
  const be = getBeVerb(whoPart)
  return `${whoPart} ${be} ${whatPart} ${wherePart}.`
}
