import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SplashGate } from './components/pwa/SplashGate'
import { GameActivityProvider } from './context/GameActivityContext'
import { ensureGamesRegistered } from './games/registerGames'
import './index.css'
import App from './App.tsx'
import { initSupabase } from './lib/supabase'

ensureGamesRegistered()

const root = document.getElementById('root')!

void initSupabase().then(() => {
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <GameActivityProvider>
        <SplashGate>
          <App />
        </SplashGate>
      </GameActivityProvider>
    </ErrorBoundary>
  </StrictMode>,
)
})
