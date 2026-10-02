import { avatarColors, hashSeed } from '../../lib/avatarFromSeed'

interface PlayerAvatarProps {
  seed: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 32, md: 40, lg: 52 }

export function PlayerAvatar({ seed, name, size = 'md' }: PlayerAvatarProps) {
  const px = sizes[size]
  const { a, b } = avatarColors(seed || name)
  const id = `av-${hashSeed(seed || name) % 100000}`

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      className="shrink-0 rounded-[var(--radius-sm)]"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="8" fill={`url(#${id})`} />
      <path
        d="M8 36c4-8 12-12 16-12s12 4 16 12"
        fill="rgba(0,0,0,0.25)"
      />
      <circle cx="24" cy="18" r="8" fill="rgba(255,255,255,0.2)" />
    </svg>
  )
}
