-- SUMBA core schema: games, ratings, requests, admin profiles

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- games
-- ---------------------------------------------------------------------------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  category text,
  min_players integer not null default 3,
  max_players integer not null default 12,
  created_by text,
  engine text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_slug_idx on public.games (slug);
create index if not exists games_published_idx on public.games (is_published);

-- ---------------------------------------------------------------------------
-- game_ratings
-- ---------------------------------------------------------------------------
create table if not exists public.game_ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  feedback text check (feedback is null or char_length(feedback) <= 2000),
  device_id text not null,
  created_at timestamptz not null default now(),
  constraint game_ratings_device_unique unique (game_id, device_id)
);

create index if not exists game_ratings_game_id_idx on public.game_ratings (game_id);

-- ---------------------------------------------------------------------------
-- game_requests
-- ---------------------------------------------------------------------------
create table if not exists public.game_requests (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text not null check (char_length(trim(description)) >= 10),
  voice_path text,
  status text not null default 'pending' check (
    status in (
      'pending',
      'reviewing',
      'planned',
      'building',
      'completed',
      'rejected'
    )
  ),
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_requests_status_idx on public.game_requests (status);

-- ---------------------------------------------------------------------------
-- admin_profiles
-- ---------------------------------------------------------------------------
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

drop trigger if exists game_requests_set_updated_at on public.game_requests;
create trigger game_requests_set_updated_at
  before update on public.game_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.games enable row level security;
alter table public.game_ratings enable row level security;
alter table public.game_requests enable row level security;
alter table public.admin_profiles enable row level security;

-- games
drop policy if exists "Public read published games" on public.games;
create policy "Public read published games"
  on public.games
  for select
  to anon, authenticated
  using (is_published = true or public.is_admin());

drop policy if exists "Admins update games" on public.games;
create policy "Admins update games"
  on public.games
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- game_ratings
drop policy if exists "Public insert ratings" on public.game_ratings;
create policy "Public insert ratings"
  on public.game_ratings
  for insert
  to anon, authenticated
  with check (
    rating >= 1
    and rating <= 5
    and device_id is not null
    and char_length(device_id) > 0
    and (
      feedback is null
      or char_length(trim(feedback)) > 0
    )
  );

drop policy if exists "Public read rating rows for aggregates" on public.game_ratings;
create policy "Public read rating rows for aggregates"
  on public.game_ratings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins read all ratings" on public.game_ratings;
create policy "Admins read all ratings"
  on public.game_ratings
  for select
  to authenticated
  using (public.is_admin());

-- game_requests
drop policy if exists "Public insert game requests" on public.game_requests;
create policy "Public insert game requests"
  on public.game_requests
  for insert
  to anon, authenticated
  with check (
    char_length(trim(description)) >= 10
    and (
      title is null
      or char_length(trim(title)) > 0
    )
  );

drop policy if exists "Admins read game requests" on public.game_requests;
create policy "Admins read game requests"
  on public.game_requests
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins update game requests" on public.game_requests;
create policy "Admins update game requests"
  on public.game_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- admin_profiles
drop policy if exists "Users read own admin profile" on public.admin_profiles;
create policy "Users read own admin profile"
  on public.admin_profiles
  for select
  to authenticated
  using (user_id = auth.uid());
