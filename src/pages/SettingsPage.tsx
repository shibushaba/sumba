import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePlayerAuthOptional } from '../components/auth/PlayerAuthProvider'
import { GlassPanel } from '../components/ui/glass/GlassPanel'
import { usePWAInstall } from '../hooks/usePWAInstall'
import {
  isHapticsEnabled,
  isSoundEnabled,
  setHapticsEnabled,
  setSoundEnabled,
} from '../lib/preferences'
import { AnimatedPage } from '../components/motion/AnimatedPage'

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-4">
      <span className="font-display text-xs font-bold uppercase tracking-wide">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={[
          'relative h-8 w-14 rounded-full border transition-colors',
          checked ? 'border-primary bg-primary/25' : 'border-[var(--smb-border)] bg-black/30',
        ].join(' ')}
        onClick={() => onChange(!checked)}
      >
        <span
          className={[
            'absolute top-1 h-6 w-6 rounded-full bg-foreground transition-transform',
            checked ? 'left-7' : 'left-1',
          ].join(' ')}
        />
      </button>
    </label>
  )
}

export function SettingsPage() {
  const auth = usePlayerAuthOptional()
  const user = auth?.user ?? null
  const profile = auth?.profile ?? null
  const { canInstall, install, showIosHint, isStandalone } = usePWAInstall()
  const [sound, setSound] = useState(true)
  const [haptics, setHaptics] = useState(true)

  useEffect(() => {
    setSound(isSoundEnabled())
    setHaptics(isHapticsEnabled())
  }, [])

  return (
    <AnimatedPage className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold uppercase">Settings</h1>

      <section>
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
          Preferences
        </h2>
        <GlassPanel className="divide-y divide-[var(--smb-border)]">
          <ToggleRow
            label="Sound"
            checked={sound}
            onChange={(v) => {
              setSound(v)
              setSoundEnabled(v)
            }}
          />
          <ToggleRow
            label="Vibration"
            checked={haptics}
            onChange={(v) => {
              setHaptics(v)
              setHapticsEnabled(v)
            }}
          />
        </GlassPanel>
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">App</h2>
        <GlassPanel className="space-y-3">
          {!isStandalone && (canInstall || showIosHint) ? (
            <div>
              <p className="font-display text-xs font-bold uppercase">Install SUMBA</p>
              {showIosHint ? (
                <p className="mt-1 text-xs text-muted">Tap Share → Add to Home Screen.</p>
              ) : (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-primary underline"
                  onClick={() => void install()}
                >
                  Install now
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Installed or not available on this device.</p>
          )}
          <Link to="/about" className="block text-sm text-foreground underline-offset-2 hover:underline">
            About
          </Link>
        </GlassPanel>
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Player</h2>
        <Link to="/players" className="glass-panel block rounded-[var(--radius-md)] px-4 py-3 text-sm font-bold uppercase">
          Saved players
        </Link>
      </section>

      {user ? (
        <section>
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Account</h2>
          <GlassPanel>
            <p className="font-display text-sm font-bold uppercase">{profile?.username}</p>
            <button
              type="button"
              className="mt-3 text-sm text-primary underline"
              onClick={() => void auth?.logout()}
            >
              Log out
            </button>
          </GlassPanel>
        </section>
      ) : null}
    </AnimatedPage>
  )
}
