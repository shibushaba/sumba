import { usePWAInstall } from '../../hooks/usePWAInstall'
import { useGameActivity } from '../../context/GameActivityContext'
import { STORAGE_KEYS } from '../../lib/storageKeys'
import { GlassButton } from '../ui/glass/GlassButton'
import { GlassPanel } from '../ui/glass/GlassPanel'

export function InstallPrompt() {
  const { canPrompt, showIosHint, install, dismiss, canInstall } = usePWAInstall()
  const { isGameActive } = useGameActivity()

  if (!canPrompt || isGameActive) return null

  const seen = localStorage.getItem(STORAGE_KEYS.installPromptSeen) === 'true'
  if (seen && !canInstall) return null

  return (
    <div
      className="fixed bottom-[calc(var(--nav-height)+0.5rem)] left-4 right-4 z-50 mx-auto max-w-[430px]"
      role="dialog"
      aria-labelledby="install-prompt-title"
    >
      <GlassPanel className="motion-install-sheet border border-[var(--smb-border-strong)]">
        <p
          id="install-prompt-title"
          className="font-display text-xs font-bold uppercase tracking-wide"
        >
          Get SUMBA on your phone
        </p>
        <p className="mt-1 text-sm text-muted">Install for a faster launch.</p>
        {showIosHint ? (
          <p className="mt-2 text-xs text-muted">Tap Share → Add to Home Screen.</p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2">
          {canInstall ? (
            <GlassButton fullWidth haptic="medium" onClick={() => void install()}>
              Install SUMBA
            </GlassButton>
          ) : null}
          <GlassButton
            variant="secondary"
            fullWidth
            sound={false}
            onClick={() => {
              localStorage.setItem(STORAGE_KEYS.installPromptSeen, 'true')
              dismiss()
            }}
          >
            Not now
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  )
}
