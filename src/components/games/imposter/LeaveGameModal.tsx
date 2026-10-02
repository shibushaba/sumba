import { Button } from '../../ui/Button'

interface LeaveGameModalProps {
  open: boolean
  onStay: () => void
  onLeave: () => void
}

export function LeaveGameModal({ open, onStay, onLeave }: LeaveGameModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-game-title"
    >
      <div className="glass-panel brutal-shadow w-full max-w-sm border-2 border-foreground p-6">
        <h2
          id="leave-game-title"
          className="font-display text-2xl font-black uppercase"
        >
          Leave game?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Your current round will be lost.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" fullWidth onClick={onStay}>
            Keep playing
          </Button>
          <Button variant="secondary" size="md" fullWidth onClick={onLeave}>
            Leave game
          </Button>
        </div>
      </div>
    </div>
  )
}
