# SUMBA Supabase setup

## 1. Create / use a Supabase project

Create a project at [https://supabase.com](https://supabase.com) or use an existing one.

Your app reads:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Copy `.env.example` → `.env` and fill both values from **Project Settings → API**.

Never commit `.env`. Never put the **service role** key in the frontend.

---

## 2. Apply database migrations

Your remote project must have all tables (`games`, `profiles`, `game_packs`, `game_stats`, etc.).

### Option A — Supabase CLI (recommended)

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
# Enter your database password when prompted (Settings → Database)
supabase db push
```

From this repo root you can also run:

```bash
npm run supabase:push
```

(`supabase/config.toml` uses `project_id` — update it if your ref differs from `.env`.)

### Option B — SQL Editor (one paste)

1. Open **SQL Editor** in the Supabase Dashboard.
2. Paste the contents of **`supabase/BUNDLE_ALL_MIGRATIONS.sql`** (generated from `supabase/migrations/`).
3. Run once on a **new** project.  
   If you already ran older migrations, run only the new files:
   - `20260321140000_imposter_v2_auth_packs.sql`
   - `20260321140100_imposter_v2_grants_auth.sql`

Regenerate the bundle after editing migrations:

```bash
npm run supabase:bundle
```

---

## 3. Authentication (players + admin)

### Player accounts (Imposter V2)

- Players only see **username + 4-digit PIN** (no email in the UI).
- Sign-in runs through the **`player-auth` Edge Function** (admin API), which avoids public sign-up rate limits and never sends email.

Deploy the function after linking the project:

```bash
supabase functions deploy player-auth --no-verify-jwt
```

**Dashboard → Authentication → Providers:** keep **Email** enabled (internal only; players never type an email).

Optional: disable **Confirm email** under Auth settings for faster testing.

### Admin accounts

1. **Authentication → Users** → create an admin user (normal email + password).
2. SQL Editor:

```sql
insert into public.admin_profiles (user_id, role)
values ('YOUR_ADMIN_USER_UUID', 'admin');
```

Admins use `/admin/login` (email/password), separate from player login.

---

## 4. Imposter V2 backend features

After migrations:

| Feature | Table / RPC |
|--------|-------------|
| Player identity | `profiles` |
| Pack metadata | `game_packs` |
| Special pack words | `pack_words` (admin only; players use `draw_special_pack_word`) |
| Pack access | `user_pack_access` |
| Round host + completion | `game_rounds`, RPC `complete_imposter_round` |
| Leaderboard | `game_stats` + `profiles` |

**Leaderboard points:** use a player’s **SUMBA username** as their name in the pass-and-play list so the RPC can match `profiles.username`.

### Grant special pack access (SQL)

```sql
-- Find user
select user_id, username from public.profiles where lower(username) = 'shibu';

-- Grant pack (use pack id from game_packs)
insert into public.user_pack_access (user_id, pack_id, granted_by)
values (
  'PLAYER_USER_UUID',
  'SPECIAL_PACK_UUID',
  'YOUR_ADMIN_USER_UUID'
);
```

Or use **Admin → Packs** in the app (grant by username).

### Add words to a special pack (admin only)

```sql
insert into public.pack_words (pack_id, word)
values ('SPECIAL_PACK_UUID', 'ExampleWord');
```

---

## 5. Storage

Migration `20260321120200_storage_game_requests.sql` creates the private `game-requests` bucket for voice suggestions.

---

## 6. Verify

1. `npm run dev` — homepage loads games (or Imposter fallback if DB empty).
2. `/games/imposter` — create player account, sign in, start a round.
3. Finish a round — leaderboard RPC runs (check **Logs** if stats don’t move).
4. `/admin/login` — games, packs, requests.

### Quick API check

With migrations applied, this should return `[]` or rows (not 404):

`GET /rest/v1/games?select=slug&limit=1` with `apikey` + `Authorization: Bearer <anon_key>`.

---

## 7. Troubleshooting

| Issue | Fix |
|--------|-----|
| REST `404` on `games` / `profiles` | Migrations not applied — run **§2** |
| `supabase link` wrong project | Match **project ref** in URL with `supabase link --project-ref` |
| Player sign-up fails | Enable Email auth; disable confirm email for dev |
| Special pack empty | Add rows to `pack_words`; grant `user_pack_access` |
| No leaderboard points | Player name must match `profiles.username` (case-insensitive) |

---

## CLI note

Run `supabase login` in your own terminal. Do not commit database passwords or access tokens to the repo.
