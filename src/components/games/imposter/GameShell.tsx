import type { ReactNode } from 'react'
import { SumbaBackground } from '../../layout/SumbaBackground'
import { useImposterGameOptional } from './ImposterGameContext'
import { PhaseHeader } from './PhaseHeader'

interface GameShellProps {
  children: ReactNode
  footer?: ReactNode
  title?: string
  progress?: string
  immersive?: boolean
  onBack?: () => void
  centerContent?: boolean
}

export function GameShell({
  children,
  footer,
  title = 'Imposter',
  progress,
  immersive = false,
  onBack,
  centerContent = true,
}: GameShellProps) {
  const imposter = useImposterGameOptional()
  const handleBack = onBack ?? imposter?.goBack

  return (
    <div className="game-arena relative flex min-h-dvh flex-col">
      <SumbaBackground />
      <div className="game-vignette" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:max-w-xl">
        <PhaseHeader
          title={title}
          progress={progress}
          immersive={immersive}
          onBack={handleBack}
        />
        <main
          className={[
            'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto',
            centerContent ? 'justify-center' : '',
          ].join(' ')}
        >
          {children}
        </main>
        {footer ? (
          <footer className="sticky bottom-0 z-20 mt-4 shrink-0 space-y-3 border-t-2 border-border/50 bg-[#080808]/90 pt-4 backdrop-blur-sm">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
