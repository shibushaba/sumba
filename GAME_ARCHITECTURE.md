# SUMBA game architecture

## Overview

SUMBA separates **platform concerns** (discovery, routing, sessions, ratings) from **game-specific logic** (rules, state, screens).

- **Supabase** stores published game metadata (name, icon, ratings, publish state).
- **The app registry** maps slugs to local engines and play UI.
- **Each game module** owns its engine, data, and components.

## Directory layout

```
src/
├── game-engine/core/     # Registry, session helpers, shared types
├── games/
│   ├── registerGames.ts  # Boot-time registration
│   └── imposter/         # Imposter module
│       ├── definition.ts
│       ├── engine.ts
│       ├── data/words.ts
│       └── components/Play.tsx
├── services/gameCatalog.ts
└── pages/GamePlayPage.tsx
```

## Adding a new game (example: Mafia)

1. Create `src/games/mafia/` with:
   - `definition.ts` — metadata + lazy `Play` component
   - `engine.ts` — `GameEngine<MafiaState, MafiaAction>`
   - `types.ts`, reducer/state machine, data files
   - `components/` — screens
2. Register in `src/games/registerGames.ts`:

```ts
registerGame(mafiaGameDefinition)
```

3. Add a Supabase `games` row with `slug: mafia`, `engine: mafia`, `is_published: true`.
4. Routes automatically work:
   - `/games/mafia`
   - `/games/mafia/details`

No changes to homepage cards are required — the catalog reads published games from Supabase and joins registry metadata.

## Game definition (metadata)

Single source of truth for local engine metadata lives in each game's `definition.ts`:

- slug, name, description, icon, category
- min/max players, createdBy
- engine id, engineVersion
- accent color, lazy Play component

## Registry API

- `registerGame(definition)` — once at startup
- `getGame(slug)` / `getGames()` / `hasGame(slug)`
- `loadGame(slug)` — returns installed definition

Duplicate slugs throw at registration time.

## Routing

| Route | Purpose |
|-------|---------|
| `/games/:gameSlug` | Play surface (lazy-loaded) |
| `/games/:gameSlug/details` | Game details + Play CTA |

Availability:

- Published in Supabase + engine registered → **playable**
- Published but engine missing → **coming soon**
- Unknown slug → **not found**

## Engine contract

Games implement `GameEngine<TState, TAction>`:

- `createInitialState`
- `dispatch` (pure reducer)
- optional `canDispatch`, `isGameOver`, `getResult`

UI components render state and dispatch actions — they do not embed win/loss rules.

## Supabase vs local code

| Supabase | Local code |
|----------|------------|
| Name, description, icon | Rules & state machine |
| Publish flag, ratings | Screens & animations |
| Player limits (display) | Word lists & assets |

Never store executable game logic in Supabase.

## Tests

- `src/game-engine/core/GameRegistry.test.ts` — registry behavior
- `src/games/imposter/engine.test.ts` — Imposter rules

Run: `npm test`

## Versioning

Each definition exposes `engineVersion` (Imposter: `1.0.0`) for future rule migrations.
