# SUMBA PWA

## Manifest

Configured in `vite.config.ts` via `vite-plugin-pwa`:

- **name:** SUMBA — Party Games  
- **short_name:** SUMBA  
- **display:** standalone, portrait  
- **theme / background:** near-black (`#0d0d0d` / `#0a0a0a`)  
- **icons:** `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`  
- **start_url / scope:** `/`

Regenerate icons after changing the mascot: `npm run icons`.

## Service worker

- **Registration:** auto-injected; updates use **prompt** mode (no forced reload mid-game).
- **Precache:** JS, CSS, HTML, PNG, SVG, fonts from the build.
- **Navigation:** `index.html` fallback for client routes (admin paths excluded from fallback).
- **Supabase:** `NetworkOnly` — no cache-first for `*.supabase.co`.

## Install behavior

- Hook: `usePWAInstall()` — captures `beforeinstallprompt`, tracks dismissals in `localStorage` (`sumba_install_dismissed`).
- Prompt appears after **2** route interactions, not when already installed (standalone / iOS home screen).
- iOS: shows Share → Add to Home Screen copy when relevant.

## Splash

- `AppSplash` on first launch per **browser tab session** (`sessionStorage`).
- ~900ms, dark grain + red glow on **SUMBA** title.
- Respects `prefers-reduced-motion`.

## Wake lock

- `useWakeLock(true)` while Imposter is in an active round (reveal → rating).
- Released on leave / hidden tab; re-acquired when visible again.

## Fullscreen (“Focus mode”)

- Optional control in immersive game header (`PhaseHeader`).
- User gesture only; no auto-fullscreen.

## Offline UI

- `OfflineIndicator` — brief “Offline / Game mode still works” and “Back online” toasts.
- Imposter logic is local; no Supabase required for a full round.

## Updates

- `PwaUpdateBanner` when a new service worker is waiting.
- Hidden while `GameActivityContext` reports an active game round.

## Version

App version constant: `src/constants/version.ts` (`SUMBA_VERSION`).
