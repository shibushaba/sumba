import { useRegisterSW } from 'virtual:pwa-register/react'
import { useGameActivity } from '../../context/GameActivityContext'
import { Button } from '../ui/Button'

export function PwaUpdateBanner() {
  const { isGameActive } = useGameActivity()

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      // default registration
    },
  })

  if (!needRefresh) return null

  if (isGameActive) {
    return null
  }

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[55] px-4 pt-[max(0.5rem,env(safe-area-inset-top))]"
      role="dialog"
      aria-labelledby="pwa-update-title"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 border-2 border-foreground bg-surface p-4 brutal-shadow-sm sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p id="pwa-update-title" className="font-display text-sm font-black uppercase">
            SUMBA updated
          </p>
          <p className="mt-1 text-sm text-muted">There&apos;s a newer version ready.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="md"
            onClick={() => {
              void updateServiceWorker(true)
            }}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setNeedRefresh(false)}
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}
