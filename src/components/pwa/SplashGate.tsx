import { useState, type ReactNode } from 'react'
import { AppSplash, shouldShowSplash } from './AppSplash'

export function SplashGate({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(shouldShowSplash)

  if (showSplash) {
    return <AppSplash onComplete={() => setShowSplash(false)} />
  }

  return children
}
