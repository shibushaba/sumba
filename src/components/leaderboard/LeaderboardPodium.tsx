import { Crown } from 'lucide-react'
import { CountUp } from '../../motion/CountUp'
import type { OwnerLeaderboardRow } from '../../services/leaderboard'
import { PlayerAvatar } from '../players/PlayerAvatar'

interface LeaderboardPodiumProps {
  rows: OwnerLeaderboardRow[]
  periodLabel: string
  compact?: boolean
}

export function LeaderboardPodium({
  rows,
  periodLabel,
  compact = false,
}: LeaderboardPodiumProps) {
  const [first, second, third] = rows

  if (!first) return null

  return (
    <div className="lb-podium-stage">
      <div className="relative z-[1] mb-3 flex items-center justify-between gap-2 px-2">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
          Top 3
        </p>
        <span className="rounded-full border border-[var(--smb-border)] bg-black/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
          {periodLabel}
        </span>
      </div>

      <div
        className={[
          'relative z-[1] flex items-end justify-center gap-1.5 px-1',
          compact ? 'min-h-[168px]' : 'min-h-[200px]',
        ].join(' ')}
      >
        <PodiumSlot row={second} rank={2} tone="silver" compact={compact} />
        <PodiumSlot row={first} rank={1} tone="gold" tall compact={compact} />
        <PodiumSlot row={third} rank={3} tone="bronze" compact={compact} />
      </div>
    </div>
  )
}

function PodiumSlot({
  row,
  rank,
  tone,
  tall = false,
  compact,
}: {
  row?: OwnerLeaderboardRow
  rank: number
  tone: 'gold' | 'silver' | 'bronze'
  tall?: boolean
  compact?: boolean
}) {
  const pedestalClass =
    tone === 'gold'
      ? 'lb-pedestal-gold'
      : tone === 'silver'
        ? 'lb-pedestal-silver'
        : 'lb-pedestal-bronze'

  const ringClass =
    tone === 'gold'
      ? 'lb-avatar-ring-gold'
      : tone === 'silver'
        ? 'lb-avatar-ring-silver'
        : 'lb-avatar-ring-bronze'

  const labelColor =
    tone === 'gold'
      ? 'text-[var(--smb-gold)]'
      : tone === 'silver'
        ? 'text-[var(--smb-silver)]'
        : 'text-[var(--smb-bronze)]'

  if (!row) {
    return (
      <div
        className={[
          'flex-1 max-w-[108px] opacity-25',
          tall ? (compact ? 'h-28' : 'h-32') : compact ? 'h-20' : 'h-24',
        ].join(' ')}
        aria-hidden
      />
    )
  }

  const stagger =
    rank === 1 ? 'motion-stagger-2' : rank === 2 ? 'motion-stagger-1' : 'motion-stagger-3'

  return (
    <div
      className={[
        'motion-podium-rise flex flex-1 max-w-[108px] flex-col items-center',
        stagger,
        tall ? '-mt-1' : '',
      ].join(' ')}
    >
      {rank === 1 ? (
        <Crown className={`mb-0.5 h-5 w-5 ${labelColor}`} aria-hidden />
      ) : (
        <span className={`mb-1 font-display text-[10px] font-bold ${labelColor}`}>#{rank}</span>
      )}

      <div className={`rounded-[var(--radius-sm)] ${ringClass}`}>
        <PlayerAvatar
          seed={row.avatarSeed}
          name={row.displayName}
          size={tall ? (compact ? 'md' : 'lg') : 'md'}
        />
      </div>

      <p className="mt-2 w-full truncate text-center font-display text-[11px] font-bold uppercase leading-tight">
        {row.displayName}
      </p>

      <div className="mt-1 flex items-baseline gap-0.5">
        <CountUp
          value={row.totalPoints}
          className={[
            'font-display font-black tabular-nums leading-none',
            tall ? 'text-2xl' : 'text-xl',
            labelColor,
          ].join(' ')}
        />
        <span className="text-[8px] font-bold uppercase tracking-wider text-muted">pts</span>
      </div>

      <div
        className={[
          'mt-2 flex w-full items-end justify-center rounded-t-[var(--radius-sm)] border border-b-0',
          pedestalClass,
          tall ? (compact ? 'h-14' : 'h-[4.25rem]') : compact ? 'h-9' : 'h-11',
        ].join(' ')}
      >
        <span className="pb-1 font-display text-xs font-bold text-foreground/80">#{rank}</span>
      </div>
    </div>
  )
}
