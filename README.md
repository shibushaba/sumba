# SUMBA

Party games for people who are together — a React PWA built with Vite, TypeScript, and Tailwind.

## Requirements

- Node.js 20+
- npm

## Environment

Create `.env` in the project root (see `SUPABASE_SETUP.md`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Imposter gameplay works offline without Supabase. Ratings, suggestions, and admin need a configured backend.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build + PWA assets |
| `npm run preview` | Serve production build |
| `npm test` | Unit tests (Vitest) |
| `npm run icons` | Regenerate PWA icons from `src/assets/branding/sumba-mascot-source.png` |

## Install as PWA

**Chrome / Edge (desktop or Android):** Open the site, use the browser install action or SUMBA’s install prompt after a couple of interactions.

**iOS Safari:** Share → **Add to Home Screen**.

See [PWA.md](./PWA.md) for manifest, service worker, offline behavior, and update handling.

## Supported browsers

- Chrome, Edge (recommended for install + wake lock)
- Safari iOS 16+ (Add to Home Screen; no `beforeinstallprompt`)
- Firefox (playable; limited PWA install APIs)

## Offline behavior

After one online visit, the app shell and Imposter bundle are cached. Pass-and-play Imposter does not require network. Supabase calls (ratings, suggest, admin) use network-only caching and fail gracefully offline.

## Architecture

Game platform docs: [GAME_ARCHITECTURE.md](./GAME_ARCHITECTURE.md).
