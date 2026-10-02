import { useEffect, useState, type ReactNode } from 'react'
import { GAME_HELP, isGameHelpSeen, markGameHelpSeen } from '../../lib/gameHelp'
import { HowToPlayModal } from './HowToPlayModal'

interface HowToPlayGateProps {
  gameSlug: string
  children: ReactNode
}

export function HowToPlayGate({ gameSlug, children }: HowToPlayGateProps) {
  const [show, setShow] = useState(false)
  const content = GAME_HELP[gameSlug]

  useEffect(() => {
    if (!content) return
    if (!isGameHelpSeen(gameSlug)) setShow(true)
  }, [gameSlug, content])

  function dismiss() {
    markGameHelpSeen(gameSlug)
    setShow(false)
  }

  return (
    <>
      {children}
      {show && content ? <HowToPlayModal content={content} onDismiss={dismiss} /> : null}
    </>
  )
}
