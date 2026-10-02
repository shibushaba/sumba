import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AmbientBackground } from './AmbientBackground'
import { BackButton } from '../ui/BackButton'

interface FullscreenMessageLayoutProps {
  children: ReactNode
  backTo?: string
}

export function FullscreenMessageLayout({
  children,
  backTo = '/games',
}: FullscreenMessageLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-dvh flex-col px-4 pb-safe pt-safe text-foreground">
      <AmbientBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col">
        <BackButton onClick={() => navigate(backTo)} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {children}
        </div>
      </div>
    </div>
  )
}
