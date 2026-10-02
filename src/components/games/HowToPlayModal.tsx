import { GlassButton } from '../ui/glass/GlassButton'
import { GlassPanel } from '../ui/glass/GlassPanel'
import type { GameHelpContent } from '../../lib/gameHelp'

interface HowToPlayModalProps {
  content: GameHelpContent
  onDismiss: () => void
}

export function HowToPlayModal({ content, onDismiss }: HowToPlayModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
      role="dialog"
      aria-labelledby="how-to-play-title"
    >
      <GlassPanel className="motion-modal-panel w-full max-w-md border border-[var(--smb-border-strong)]">
        <h2 id="how-to-play-title" className="font-display text-lg font-bold uppercase tracking-wide">
          How to play
        </h2>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted">{content.title}</p>
        <ol className="mt-4 space-y-2 text-sm text-foreground/90">
          {content.steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="font-display text-primary">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col gap-2">
          <GlassButton fullWidth haptic="medium" onClick={onDismiss}>
            Got it
          </GlassButton>
          <GlassButton variant="ghost" fullWidth sound={false} onClick={onDismiss}>
            Skip
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  )
}
