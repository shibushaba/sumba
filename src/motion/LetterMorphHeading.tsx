import { useEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const MORPH_CHARS = 'WN?*'

interface LetterMorphHeadingProps {
  text: string
  className?: string
  intervalMs?: number
}

export function LetterMorphHeading({
  text,
  className = '',
  intervalMs = 4200,
}: LetterMorphHeadingProps) {
  const reduced = usePrefersReducedMotion()
  const chars = useMemo(() => text.split(''), [text])
  const [morphIndex, setMorphIndex] = useState<number | null>(null)
  const [altChar, setAltChar] = useState('')

  useEffect(() => {
    if (reduced) return
    const letters = chars
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => /[A-Za-z?]/.test(c))
    if (letters.length === 0) return

    const id = window.setInterval(() => {
      const pick = letters[Math.floor(Math.random() * letters.length)]
      const base = pick.c.toUpperCase()
      const options = MORPH_CHARS.split('').filter((x) => x !== base)
      setAltChar(options[Math.floor(Math.random() * options.length)] ?? base)
      setMorphIndex(pick.i)
      window.setTimeout(() => setMorphIndex(null), 480)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [chars, reduced, intervalMs])

  return (
    <h1 className={className} aria-label={text}>
      {chars.map((char, index) => {
        const isMorph = morphIndex === index
        const display = isMorph ? altChar : char
        const isSpace = char === ' '
        return (
          <span
            key={`${index}-${char}`}
            className={[
              isSpace ? '' : 'motion-letter-slot',
              isMorph ? 'motion-letter-morph text-primary' : '',
            ].join(' ')}
            aria-hidden={isSpace ? undefined : true}
          >
            {isSpace ? '\u00A0' : display}
          </span>
        )
      })}
    </h1>
  )
}
