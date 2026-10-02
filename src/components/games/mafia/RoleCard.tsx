import { Search, Skull, Stethoscope, User } from 'lucide-react'
import type { MafiaRole } from '../../../games/mafia/types'
import { MafiaDetectiveArtwork } from '../../game-art/MafiaDetectiveArtwork'

const roleMeta: Record<
  MafiaRole,
  { label: string; icon: typeof Skull; className: string }
> = {
  mafia: {
    label: 'Mafia',
    icon: Skull,
    className: 'text-primary game-red-pulse border-primary',
  },
  doctor: {
    label: 'Doctor',
    icon: Stethoscope,
    className: 'text-emerald-400 border-emerald-500/60',
  },
  detective: {
    label: 'Detective',
    icon: Search,
    className: 'text-sky-400 border-sky-500/60',
  },
  civilian: {
    label: 'Civilian',
    icon: User,
    className: 'text-muted border-border',
  },
}

interface RoleCardProps {
  role: MafiaRole
}

export function RoleCard({ role }: RoleCardProps) {
  const meta = roleMeta[role]
  const Icon = meta.icon
  const revealClass =
    role === 'mafia'
      ? 'role-reveal-mafia'
      : role === 'doctor'
        ? 'motion-scale-in'
        : role === 'detective'
          ? 'motion-reveal-blur'
          : 'motion-scale-in'

  return (
    <div
      className={[
        'mx-auto w-full max-w-sm border-2 bg-surface/80 px-6 py-10 text-center',
        meta.className,
        revealClass,
      ].join(' ')}
    >
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted">You are</p>
      {role === 'detective' ? (
        <div className="relative mx-auto mt-4 h-28 w-full max-w-[280px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--smb-border)]">
          <MafiaDetectiveArtwork />
        </div>
      ) : (
        <Icon className="mx-auto mt-6 h-14 w-14" aria-hidden />
      )}
      <p className="mt-6 font-display text-[clamp(2rem,10vw,3.25rem)] font-black uppercase leading-none">
        {meta.label}
      </p>
    </div>
  )
}
