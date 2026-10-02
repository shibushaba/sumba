import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Maximize2, Minimize2, Volume2, VolumeX, Vibrate, VibrateOff } from 'lucide-react'
import { useFullscreen } from '../../../hooks/useFullscreen'
import {
  isHapticsEnabled,
  isSoundEnabled,
  setHapticsEnabled,
  setSoundEnabled,
} from '../../../lib/preferences'
import { BackButton } from '../../ui/BackButton'

interface PhaseHeaderProps {
  title: string
  progress?: string
  immersive?: boolean
  onBack?: () => void
}

export function PhaseHeader({ title, progress, immersive = false, onBack }: PhaseHeaderProps) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled())
  const [hapticsOn, setHapticsOn] = useState(isHapticsEnabled())
  const { isFullscreen, supported: fullscreenSupported, toggle } = useFullscreen()

  if (!immersive) {
    return (
      <header className="mb-4 shrink-0 space-y-3">
        {onBack ? <BackButton onClick={onBack} /> : null}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-display text-xl font-black uppercase tracking-tight"
          >
            SUMBA
          </Link>
          <span className="text-xs font-bold uppercase text-muted">{title}</span>
        </div>
      </header>
    )
  }

  return (
    <header className="mb-4 shrink-0 space-y-2 border-b-2 border-border/60 pb-3">
      {onBack ? <BackButton onClick={onBack} /> : null}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-xs font-black uppercase text-muted">Sumba</p>
          <p className="truncate font-display text-lg font-black uppercase leading-tight">
            {title}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {progress ? (
            <span className="font-display text-xs font-black uppercase text-primary">
              {progress}
            </span>
          ) : null}
          <button
            type="button"
            aria-label={soundOn ? 'Sound on' : 'Sound off'}
            className="border-2 border-border p-2 text-muted hover:border-foreground"
            onClick={() => {
              const next = !soundOn
              setSoundOn(next)
              setSoundEnabled(next)
            }}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label={hapticsOn ? 'Haptics on' : 'Haptics off'}
            className="border-2 border-border p-2 text-muted hover:border-foreground"
            onClick={() => {
              const next = !hapticsOn
              setHapticsOn(next)
              setHapticsEnabled(next)
            }}
          >
            {hapticsOn ? <Vibrate className="h-4 w-4" /> : <VibrateOff className="h-4 w-4" />}
          </button>
          {fullscreenSupported ? (
            <button
              type="button"
              aria-label={isFullscreen ? 'Exit focus mode' : 'Focus mode fullscreen'}
              title="Focus mode"
              className="border-2 border-border p-2 text-muted hover:border-foreground"
              onClick={() => void toggle()}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
