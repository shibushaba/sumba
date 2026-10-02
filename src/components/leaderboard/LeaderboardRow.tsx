import type { OwnerLeaderboardRow } from '../../services/leaderboard'
import { CountUp } from '../../motion/CountUp'
import { PlayerAvatar } from '../players/PlayerAvatar'

interface LeaderboardRowProps {
  row: OwnerLeaderboardRow
  rank: number
  highlight?: boolean
  index?: number
}

export function LeaderboardRow({ row, rank, highlight, index = 0 }: LeaderboardRowProps) {
  return (
    <li
      className={[
        'motion-slide-up motion-press-card flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3',
        highlight
          ? 'lb-self-card ring-1 ring-primary/30'
          : 'glass-panel border-[var(--smb-border)]',
        index < 5 ? `motion-stagger-${index + 1}` : '',
      ].join(' ')}
    >
      <span className="lb-row-rank tabular-nums">{rank}</span>
      <PlayerAvatar seed={row.avatarSeed} name={row.displayName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold uppercase leading-tight">
          {row.displayName}
        </p>
        {highlight ? (
          <p className="text-[9px] font-bold uppercase tracking-wider text-primary">Your player</p>
        ) : null}
      </div>
      <div className="text-right">
        <CountUp
          value={row.totalPoints}
          className="font-display text-lg font-black tabular-nums leading-none"
        />
        <p className="text-[8px] font-bold uppercase tracking-wider text-muted">pts</p>
      </div>
    </li>
  )
}
