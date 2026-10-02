-- ===== 20260321120000_core_schema.sql =====

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


-- ===== 20260321120100_seed_imposter.sql =====

insert into public.games (
  slug,
  name,
  description,
  icon,
  category,
  min_players,
  max_players,
  created_by,
  engine,
  is_published
)
values (
  'imposter',
  'Imposter',
  'One of you doesn''t know the word. Find them before they find you.',
  '🕵️',
  'Social Deduction',
  3,
  12,
  'Shabas',
  'imposter',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  category = excluded.category,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  created_by = excluded.created_by,
  engine = excluded.engine,
  is_published = excluded.is_published,
  updated_at = now();


-- ===== 20260321120200_storage_game_requests.sql =====

-- Private bucket for voice suggestions (signed URLs for admins only)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-requests',
  'game-requests',
  false,
  5242880,
  array[
    'audio/webm',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/x-wav'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public upload game request audio" on storage.objects;
create policy "Public upload game request audio"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'game-requests'
    and (storage.extension(name) in ('webm', 'ogg', 'mp3', 'm4a', 'wav'))
  );

drop policy if exists "Admins read game request audio" on storage.objects;
create policy "Admins read game request audio"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'game-requests' and public.is_admin());


-- ===== 20260321140000_imposter_v2_auth_packs.sql =====

-- Imposter V2: player profiles, packs, rounds, stats

-- ---------------------------------------------------------------------------
-- profiles (player identity)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text,
  avatar_seed text,
  created_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 20),
  constraint profiles_username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- game_packs
-- ---------------------------------------------------------------------------
create table if not exists public.game_packs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  pack_type text not null check (pack_type in ('core', 'malayalam', 'special')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_packs_type_idx on public.game_packs (pack_type);

-- ---------------------------------------------------------------------------
-- pack_words (special / admin-managed; core pools ship in app)
-- ---------------------------------------------------------------------------
create table if not exists public.pack_words (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.game_packs (id) on delete cascade,
  word text not null,
  created_at timestamptz not null default now(),
  constraint pack_words_word_nonempty check (char_length(trim(word)) > 0)
);

create index if not exists pack_words_pack_id_idx on public.pack_words (pack_id);

-- ---------------------------------------------------------------------------
-- user_pack_access
-- ---------------------------------------------------------------------------
create table if not exists public.user_pack_access (
  user_id uuid not null references auth.users (id) on delete cascade,
  pack_id uuid not null references public.game_packs (id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id),
  primary key (user_id, pack_id)
);

-- ---------------------------------------------------------------------------
-- game_rounds
-- ---------------------------------------------------------------------------
create table if not exists public.game_rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  pack_id uuid references public.game_packs (id),
  pack_slug text,
  round_number integer not null default 1,
  created_by uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  completion_token text unique,
  constraint game_rounds_completed_pair check (
    (completed_at is null and completion_token is null)
    or (completed_at is not null and completion_token is not null)
  )
);

create index if not exists game_rounds_game_id_idx on public.game_rounds (game_id);
create index if not exists game_rounds_created_by_idx on public.game_rounds (created_by);

-- ---------------------------------------------------------------------------
-- game_round_players (display names; roles not stored publicly)
-- ---------------------------------------------------------------------------
create table if not exists public.game_round_players (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.game_rounds (id) on delete cascade,
  player_order integer not null,
  display_name text not null,
  linked_user_id uuid references auth.users (id),
  is_imposter boolean not null default false,
  points_awarded integer not null default 0
);

create index if not exists game_round_players_round_idx on public.game_round_players (round_id);

-- ---------------------------------------------------------------------------
-- game_round_votes
-- ---------------------------------------------------------------------------
create table if not exists public.game_round_votes (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.game_rounds (id) on delete cascade,
  voter_name text not null,
  target_name text not null
);

create index if not exists game_round_votes_round_idx on public.game_round_votes (round_id);

-- ---------------------------------------------------------------------------
-- game_stats
-- ---------------------------------------------------------------------------
create table if not exists public.game_stats (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  total_points integer not null default 0,
  rounds_played integer not null default 0,
  correct_votes integer not null default 0,
  imposter_rounds integer not null default 0,
  imposter_survival_wins integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.user_has_pack_access(p_pack_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_pack_access
    where user_id = auth.uid()
      and pack_id = p_pack_id
  ) or public.is_admin();
$$;

create or replace function public.get_accessible_special_packs()
returns table (
  id uuid,
  name text,
  description text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.description
  from public.game_packs p
  where p.pack_type = 'special'
    and p.is_active = true
    and public.user_has_pack_access(p.id);
$$;

create or replace function public.draw_special_pack_word(p_pack_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  w text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not public.user_has_pack_access(p_pack_id) then
    raise exception 'pack access denied';
  end if;
  select pw.word into w
  from public.pack_words pw
  where pw.pack_id = p_pack_id
  order by random()
  limit 1;
  if w is null then
    raise exception 'pack has no words';
  end if;
  return w;
end;
$$;

create or replace function public.complete_imposter_round(
  p_round_id uuid,
  p_votes jsonb,
  p_players jsonb,
  p_imposter_names text[],
  p_secret_word text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_creator uuid;
  v_token text;
  v_imposter_set text[];
  rec record;
  v_points integer;
  v_profile_user uuid;
  imp_name text;
  vote_rec record;
  imposters uuid[];
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select game_id, created_by, completion_token
  into v_game_id, v_creator, v_token
  from public.game_rounds
  where id = p_round_id;

  if v_game_id is null then
    raise exception 'round not found';
  end if;
  if v_creator <> auth.uid() then
    raise exception 'only round host may submit';
  end if;
  if v_token is not null then
    raise exception 'round already completed';
  end if;

  v_imposter_set := p_imposter_names;

  for rec in
    select *
    from jsonb_to_recordset(p_players) as x(
      display_name text,
      points integer,
      is_imposter boolean
    )
  loop
    v_points := coalesce(rec.points, 0);
    select user_id into v_profile_user
    from public.profiles
    where lower(username) = lower(rec.display_name);

    if v_profile_user is not null then
      insert into public.game_stats as gs (user_id, game_id, total_points, rounds_played, correct_votes, imposter_rounds, imposter_survival_wins)
      values (
        v_profile_user,
        v_game_id,
        greatest(0, v_points),
        1,
        case when v_points > 0 and not coalesce(rec.is_imposter, false) then 1 else 0 end,
        case when coalesce(rec.is_imposter, false) then 1 else 0 end,
        case when coalesce(rec.is_imposter, false) and v_points > 0 then 1 else 0 end
      )
      on conflict (user_id, game_id) do update set
        total_points = gs.total_points + excluded.total_points,
        rounds_played = gs.rounds_played + 1,
        correct_votes = gs.correct_votes + excluded.correct_votes,
        imposter_rounds = gs.imposter_rounds + excluded.imposter_rounds,
        imposter_survival_wins = gs.imposter_survival_wins + excluded.imposter_survival_wins,
        updated_at = now();
    end if;
  end loop;

  insert into public.game_round_votes (round_id, voter_name, target_name)
  select p_round_id, v.voter_name, v.target_name
  from jsonb_to_recordset(p_votes) as v(voter_name text, target_name text);

  v_token := encode(gen_random_bytes(16), 'hex');
  update public.game_rounds
  set completed_at = now(), completion_token = v_token
  where id = p_round_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.game_packs enable row level security;
alter table public.pack_words enable row level security;
alter table public.user_pack_access enable row level security;
alter table public.game_rounds enable row level security;
alter table public.game_round_players enable row level security;
alter table public.game_round_votes enable row level security;
alter table public.game_stats enable row level security;

-- profiles
create policy "Public read profiles"
  on public.profiles for select to anon, authenticated using (true);

create policy "Users insert own profile"
  on public.profiles for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (user_id = auth.uid());

-- packs: core/malayalam metadata public; special names only if access
create policy "Read active core packs"
  on public.game_packs for select to authenticated
  using (
    pack_type in ('core', 'malayalam') and is_active
    or (pack_type = 'special' and is_active and public.user_has_pack_access(id))
    or public.is_admin()
  );

-- pack_words: no direct client read (use RPC)
create policy "Admins manage pack words"
  on public.pack_words for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- user_pack_access
create policy "Users read own pack access"
  on public.user_pack_access for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "Admins manage pack access"
  on public.user_pack_access for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- rounds
create policy "Host read own rounds"
  on public.game_rounds for select to authenticated
  using (created_by = auth.uid() or public.is_admin());

create policy "Host insert rounds"
  on public.game_rounds for insert to authenticated
  with check (created_by = auth.uid());

create policy "Host update own rounds"
  on public.game_rounds for update to authenticated
  using (created_by = auth.uid());

-- round players/votes: host only
create policy "Host read round players"
  on public.game_round_players for select to authenticated
  using (
    exists (
      select 1 from public.game_rounds r
      where r.id = round_id and (r.created_by = auth.uid() or public.is_admin())
    )
  );

create policy "Host insert round players"
  on public.game_round_players for insert to authenticated
  with check (
    exists (
      select 1 from public.game_rounds r
      where r.id = round_id and r.created_by = auth.uid()
    )
  );

create policy "Host read round votes"
  on public.game_round_votes for select to authenticated
  using (
    exists (
      select 1 from public.game_rounds r
      where r.id = round_id and (r.created_by = auth.uid() or public.is_admin())
    )
  );

create policy "Host insert round votes"
  on public.game_round_votes for insert to authenticated
  with check (
    exists (
      select 1 from public.game_rounds r
      where r.id = round_id and r.created_by = auth.uid()
    )
  );

-- stats: public leaderboard read; no direct write
create policy "Public read game stats"
  on public.game_stats for select to anon, authenticated using (true);

-- seed core pack rows (metadata only; words in app for offline)
insert into public.game_packs (slug, name, description, pack_type, is_active)
values
  ('random', 'Random', 'Anything can appear.', 'core', true),
  ('malayalam', 'Malayalam', 'Simple Malayalam words everyone knows.', 'malayalam', true)
on conflict (slug) do nothing;


-- ===== 20260321140100_imposter_v2_grants_auth.sql =====

-- Imposter V2 follow-up: RPC grants, pack triggers, profile signup helper

-- updated_at on game_packs
drop trigger if exists game_packs_set_updated_at on public.game_packs;
create trigger game_packs_set_updated_at
  before update on public.game_packs
  for each row execute function public.set_updated_at();

-- RPC execute for authenticated clients
grant execute on function public.get_accessible_special_packs() to authenticated;
grant execute on function public.draw_special_pack_word(uuid) to authenticated;
grant execute on function public.complete_imposter_round(uuid, jsonb, jsonb, text[], text) to authenticated;
grant execute on function public.user_has_pack_access(uuid) to authenticated;

-- Admins insert/update game_packs
drop policy if exists "Admins manage game packs" on public.game_packs;
create policy "Admins manage game packs"
  on public.game_packs for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Optional: create profile row when auth user signs up (username in raw_user_meta_data)
create or replace function public.handle_new_player_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if v_username = '' or char_length(v_username) < 3 then
    return new;
  end if;
  insert into public.profiles (user_id, username, display_name, avatar_seed)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', v_username),
    v_username
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_player_profile on auth.users;
create trigger on_auth_user_created_player_profile
  after insert on auth.users
  for each row execute function public.handle_new_player_user();


-- ===== 20260321140200_username_available.sql =====

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where lower(username) = lower(trim(p_username))
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;


-- ===== 20260321150000_seed_who_where_what.sql =====

insert into public.games (
  slug,
  name,
  description,
  icon,
  category,
  min_players,
  max_players,
  created_by,
  engine,
  is_published
)
values (
  'who-where-what',
  'Who, Where, What',
  'Write three things. Pass the phone. Discover the chaos.',
  '📝',
  'Party',
  3,
  12,
  'SUMBA',
  'who-where-what',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  category = excluded.category,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  created_by = excluded.created_by,
  engine = excluded.engine,
  is_published = excluded.is_published,
  updated_at = now();


-- ===== 20260321160000_mafia_leaderboard.sql =====

-- Mafia: stats columns + idempotent game completion

alter table public.game_stats
  add column if not exists mafia_wins integer not null default 0,
  add column if not exists detective_wins integer not null default 0,
  add column if not exists doctor_saves integer not null default 0,
  add column if not exists mafia_games_played integer not null default 0;

create table if not exists public.mafia_game_sessions (
  id uuid primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  winner text not null check (winner in ('mafia', 'detective')),
  rounds_played integer not null check (rounds_played between 1 and 3),
  doctor_saves integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  completion_token text unique,
  constraint mafia_sessions_completed_pair check (
    (completed_at is null and completion_token is null)
    or (completed_at is not null and completion_token is not null)
  )
);

create index if not exists mafia_game_sessions_game_idx
  on public.mafia_game_sessions (game_id);

alter table public.mafia_game_sessions enable row level security;

create policy "Hosts read own mafia sessions"
  on public.mafia_game_sessions for select to authenticated
  using (created_by = auth.uid());

create or replace function public.complete_mafia_game(
  p_session_id uuid,
  p_winner text,
  p_players jsonb,
  p_rounds_played integer,
  p_doctor_saves integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_creator uuid;
  v_token text;
  rec record;
  v_profile_user uuid;
  v_points integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_winner not in ('mafia', 'detective') then
    raise exception 'invalid winner';
  end if;

  if p_rounds_played < 1 or p_rounds_played > 3 then
    raise exception 'invalid rounds';
  end if;

  select id into v_game_id from public.games where slug = 'mafia' limit 1;
  if v_game_id is null then
    raise exception 'mafia game not found';
  end if;

  insert into public.mafia_game_sessions (id, game_id, created_by, winner, rounds_played, doctor_saves)
  values (p_session_id, v_game_id, auth.uid(), p_winner, p_rounds_played, greatest(0, coalesce(p_doctor_saves, 0)))
  on conflict (id) do nothing;

  select created_by, completion_token
  into v_creator, v_token
  from public.mafia_game_sessions
  where id = p_session_id;

  if v_creator <> auth.uid() then
    raise exception 'only session host may submit';
  end if;

  if v_token is not null then
    raise exception 'session already completed';
  end if;

  for rec in
    select *
    from jsonb_to_recordset(p_players) as x(
      display_name text,
      points integer,
      role text
    )
  loop
    v_points := greatest(0, least(1, coalesce(rec.points, 0)));
    if v_points > 1 then
      raise exception 'invalid points';
    end if;

    if p_winner = 'mafia' and rec.role <> 'mafia' and v_points > 0 then
      raise exception 'only mafia may score on mafia win';
    end if;
    if p_winner = 'detective' and rec.role <> 'detective' and v_points > 0 then
      raise exception 'only detective may score on detective win';
    end if;

    select user_id into v_profile_user
    from public.profiles
    where lower(username) = lower(rec.display_name);

    if v_profile_user is not null and v_points > 0 then
      insert into public.game_stats as gs (
        user_id,
        game_id,
        total_points,
        mafia_games_played,
        mafia_wins,
        detective_wins,
        doctor_saves
      )
      values (
        v_profile_user,
        v_game_id,
        v_points,
        1,
        case when p_winner = 'mafia' and rec.role = 'mafia' then 1 else 0 end,
        case when p_winner = 'detective' and rec.role = 'detective' then 1 else 0 end,
        case when rec.role = 'doctor' then greatest(0, coalesce(p_doctor_saves, 0)) else 0 end
      )
      on conflict (user_id, game_id) do update set
        total_points = gs.total_points + excluded.total_points,
        mafia_games_played = gs.mafia_games_played + 1,
        mafia_wins = gs.mafia_wins + excluded.mafia_wins,
        detective_wins = gs.detective_wins + excluded.detective_wins,
        doctor_saves = gs.doctor_saves + excluded.doctor_saves,
        updated_at = now();
    elsif v_profile_user is not null then
      insert into public.game_stats as gs (
        user_id,
        game_id,
        mafia_games_played,
        doctor_saves
      )
      values (
        v_profile_user,
        v_game_id,
        1,
        case when rec.role = 'doctor' then greatest(0, coalesce(p_doctor_saves, 0)) else 0 end
      )
      on conflict (user_id, game_id) do update set
        mafia_games_played = gs.mafia_games_played + 1,
        doctor_saves = gs.doctor_saves + case when rec.role = 'doctor' then greatest(0, coalesce(p_doctor_saves, 0)) else 0 end,
        updated_at = now();
    end if;
  end loop;

  v_token := encode(gen_random_bytes(16), 'hex');
  update public.mafia_game_sessions
  set completed_at = now(), completion_token = v_token
  where id = p_session_id;
end;
$$;

grant execute on function public.complete_mafia_game(uuid, text, jsonb, integer, integer) to authenticated;

insert into public.games (
  slug,
  name,
  description,
  icon,
  category,
  min_players,
  max_players,
  created_by,
  engine,
  is_published
)
values (
  'mafia',
  'Mafia',
  'Find the Mafia before they survive three rounds.',
  '🌙',
  'Party',
  5,
  12,
  'SUMBA',
  'mafia',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  category = excluded.category,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  created_by = excluded.created_by,
  engine = excluded.engine,
  is_published = excluded.is_published,
  updated_at = now();


-- ===== 20260321170000_party_max_players.sql =====

update public.games
set
  max_players = 24,
  updated_at = now()
where slug in ('imposter', 'who-where-what', 'mafia');


-- ===== 20260321170100_party_max_players_50.sql =====

update public.games
set
  max_players = 50,
  updated_at = now()
where slug in ('imposter', 'who-where-what', 'mafia');


-- ===== 20260322120000_saved_players_leaderboard.sql =====

-- Saved players, score events, owner-scoped leaderboards

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles extensions
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists timezone text not null default 'Asia/Kolkata',
  add column if not exists self_player_id uuid;

create or replace function public.normalize_player_display_name(p_name text)
returns text
language sql
immutable
as $$
  select lower(trim(p_name));
$$;

-- ---------------------------------------------------------------------------
-- saved_players
-- ---------------------------------------------------------------------------
create table if not exists public.saved_players (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  normalized_name text not null,
  avatar_seed text not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_played_at timestamptz,
  is_active boolean not null default true,
  constraint saved_players_display_name_len check (
    char_length(trim(display_name)) between 1 and 30
  ),
  unique (owner_user_id, normalized_name)
);

create index if not exists saved_players_owner_active_idx
  on public.saved_players (owner_user_id, is_active, normalized_name);

alter table public.profiles
  drop constraint if exists profiles_self_player_id_fkey;

alter table public.profiles
  add constraint profiles_self_player_id_fkey
  foreign key (self_player_id) references public.saved_players (id) on delete set null;

-- ---------------------------------------------------------------------------
-- player_score_events (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.player_score_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  player_id uuid not null references public.saved_players (id) on delete restrict,
  game_id uuid not null references public.games (id) on delete cascade,
  points integer not null check (points >= 0 and points <= 20),
  reason text not null,
  game_session_id uuid not null,
  created_at timestamptz not null default now(),
  unique (game_session_id, player_id, reason)
);

create index if not exists player_score_events_owner_game_created_idx
  on public.player_score_events (owner_user_id, game_id, created_at desc);

create index if not exists player_score_events_player_idx
  on public.player_score_events (player_id);

create index if not exists player_score_events_session_idx
  on public.player_score_events (game_session_id);

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.account_timezone()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select timezone from public.profiles where user_id = auth.uid()),
    'Asia/Kolkata'
  );
$$;

create or replace function public.leaderboard_period_start(p_period text, p_tz text)
returns timestamptz
language plpgsql
stable
as $$
declare
  local_now timestamp;
begin
  if p_period is null or p_period in ('all_time', 'all-time', 'alltime') then
    return null;
  end if;

  local_now := timezone(p_tz, now());

  if p_period in ('day', 'today') then
    return (date_trunc('day', local_now) at time zone p_tz);
  end if;

  if p_period in ('week', 'this_week', 'this-week') then
    return (date_trunc('week', local_now) at time zone p_tz);
  end if;

  if p_period in ('month', 'this_month', 'this-month') then
    return (date_trunc('month', local_now) at time zone p_tz);
  end if;

  raise exception 'unknown period: %', p_period;
end;
$$;

create or replace function public.record_player_score_event(
  p_player_id uuid,
  p_game_id uuid,
  p_points integer,
  p_reason text,
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_points is null or p_points <= 0 then
    return;
  end if;

  select owner_user_id into v_owner
  from public.saved_players
  where id = p_player_id and is_active;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'invalid player';
  end if;

  insert into public.player_score_events (
    owner_user_id,
    player_id,
    game_id,
    points,
    reason,
    game_session_id
  )
  values (
    auth.uid(),
    p_player_id,
    p_game_id,
    p_points,
    p_reason,
    p_session_id
  )
  on conflict (game_session_id, player_id, reason) do nothing;

  update public.saved_players
  set last_played_at = now(), updated_at = now()
  where id = p_player_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- saved player CRUD (RPC)
-- ---------------------------------------------------------------------------
create or replace function public.create_saved_player(p_display_name text)
returns public.saved_players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_norm text;
  v_row public.saved_players;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  v_name := trim(p_display_name);
  if char_length(v_name) < 1 or char_length(v_name) > 30 then
    raise exception 'invalid name length';
  end if;

  v_norm := public.normalize_player_display_name(v_name);

  insert into public.saved_players (owner_user_id, display_name, normalized_name)
  values (auth.uid(), v_name, v_norm)
  on conflict (owner_user_id, normalized_name) do update
    set display_name = excluded.display_name,
        updated_at = now(),
        is_active = true
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.rename_saved_player(
  p_player_id uuid,
  p_display_name text
)
returns public.saved_players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_norm text;
  v_row public.saved_players;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  v_name := trim(p_display_name);
  if char_length(v_name) < 1 or char_length(v_name) > 30 then
    raise exception 'invalid name length';
  end if;

  v_norm := public.normalize_player_display_name(v_name);

  if exists (
    select 1 from public.saved_players
    where owner_user_id = auth.uid()
      and normalized_name = v_norm
      and id <> p_player_id
  ) then
    raise exception 'duplicate name';
  end if;

  update public.saved_players
  set display_name = v_name,
      normalized_name = v_norm,
      updated_at = now()
  where id = p_player_id and owner_user_id = auth.uid()
  returning * into v_row;

  if v_row.id is null then
    raise exception 'player not found';
  end if;

  return v_row;
end;
$$;

create or replace function public.set_saved_player_active(
  p_player_id uuid,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.saved_players
  set is_active = p_active, updated_at = now()
  where id = p_player_id and owner_user_id = auth.uid();
end;
$$;

create or replace function public.link_self_saved_player(p_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from public.saved_players
    where id = p_player_id and owner_user_id = auth.uid()
  ) then
    raise exception 'player not found';
  end if;

  update public.profiles
  set self_player_id = p_player_id
  where user_id = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------------
-- leaderboard RPC
-- ---------------------------------------------------------------------------
create or replace function public.get_owner_leaderboard(
  p_game_slug text default null,
  p_period text default 'week'
)
returns table (
  player_id uuid,
  display_name text,
  avatar_seed text,
  total_points bigint,
  last_scored_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tz text;
  v_start timestamptz;
  v_game_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  v_tz := public.account_timezone();
  v_start := public.leaderboard_period_start(p_period, v_tz);

  if p_game_slug is not null and length(trim(p_game_slug)) > 0 then
    select id into v_game_id from public.games where slug = p_game_slug limit 1;
    if v_game_id is null then
      raise exception 'game not found';
    end if;
  end if;

  return query
  select
    sp.id as player_id,
    sp.display_name,
    sp.avatar_seed,
    coalesce(sum(e.points), 0)::bigint as total_points,
    max(e.created_at) as last_scored_at
  from public.saved_players sp
  left join public.player_score_events e
    on e.player_id = sp.id
    and e.owner_user_id = auth.uid()
    and (v_game_id is null or e.game_id = v_game_id)
    and (v_start is null or e.created_at >= v_start)
  where sp.owner_user_id = auth.uid()
  group by sp.id, sp.display_name, sp.avatar_seed
  having coalesce(sum(e.points), 0) > 0
  order by total_points desc, last_scored_at desc nulls last, sp.display_name asc;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.saved_players enable row level security;

drop policy if exists "Owners read saved players" on public.saved_players;
create policy "Owners read saved players"
  on public.saved_players for select to authenticated
  using (owner_user_id = auth.uid() or public.is_admin());

drop policy if exists "Owners insert saved players" on public.saved_players;
create policy "Owners insert saved players"
  on public.saved_players for insert to authenticated
  with check (owner_user_id = auth.uid());

drop policy if exists "Owners update saved players" on public.saved_players;
create policy "Owners update saved players"
  on public.saved_players for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Owners delete saved players" on public.saved_players;
create policy "Owners delete saved players"
  on public.saved_players for delete to authenticated
  using (owner_user_id = auth.uid());

alter table public.player_score_events enable row level security;

drop policy if exists "Owners read score events" on public.player_score_events;
create policy "Owners read score events"
  on public.player_score_events for select to authenticated
  using (owner_user_id = auth.uid() or public.is_admin());

-- No client insert policy — events via security definer RPCs only

drop policy if exists "Public read stats" on public.game_stats;
create policy "Users read own stats"
  on public.game_stats for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- complete_imposter_round: score events for saved players
-- ---------------------------------------------------------------------------
create or replace function public.complete_imposter_round(
  p_round_id uuid,
  p_votes jsonb,
  p_players jsonb,
  p_imposter_names text[],
  p_secret_word text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_creator uuid;
  v_token text;
  rec record;
  v_points integer;
  v_profile_user uuid;
  v_saved_player uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select game_id, created_by, completion_token
  into v_game_id, v_creator, v_token
  from public.game_rounds
  where id = p_round_id;

  if v_game_id is null then
    raise exception 'round not found';
  end if;
  if v_creator <> auth.uid() then
    raise exception 'only round host may submit';
  end if;
  if v_token is not null then
    raise exception 'round already completed';
  end if;

  for rec in
    select *
    from jsonb_to_recordset(p_players) as x(
      display_name text,
      points integer,
      is_imposter boolean,
      saved_player_id uuid
    )
  loop
    v_points := coalesce(rec.points, 0);
    v_saved_player := rec.saved_player_id;

    if v_saved_player is not null and v_points > 0 then
      perform public.record_player_score_event(
        v_saved_player,
        v_game_id,
        v_points,
        'imposter_round',
        p_round_id
      );
    end if;

    -- Legacy profile stats (username match) for backward compatibility
    select user_id into v_profile_user
    from public.profiles
    where lower(username) = lower(rec.display_name);

    if v_profile_user is not null then
      insert into public.game_stats as gs (
        user_id, game_id, total_points, rounds_played, correct_votes,
        imposter_rounds, imposter_survival_wins
      )
      values (
        v_profile_user,
        v_game_id,
        greatest(0, v_points),
        1,
        case when v_points > 0 and not coalesce(rec.is_imposter, false) then 1 else 0 end,
        case when coalesce(rec.is_imposter, false) then 1 else 0 end,
        case when coalesce(rec.is_imposter, false) and v_points > 0 then 1 else 0 end
      )
      on conflict (user_id, game_id) do update set
        total_points = gs.total_points + excluded.total_points,
        rounds_played = gs.rounds_played + 1,
        correct_votes = gs.correct_votes + excluded.correct_votes,
        imposter_rounds = gs.imposter_rounds + excluded.imposter_rounds,
        imposter_survival_wins = gs.imposter_survival_wins + excluded.imposter_survival_wins,
        updated_at = now();
    end if;
  end loop;

  insert into public.game_round_votes (round_id, voter_name, target_name)
  select p_round_id, v.voter_name, v.target_name
  from jsonb_to_recordset(p_votes) as v(voter_name text, target_name text);

  v_token := encode(gen_random_bytes(16), 'hex');
  update public.game_rounds
  set completed_at = now(), completion_token = v_token
  where id = p_round_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- complete_mafia_game: score events
-- ---------------------------------------------------------------------------
create or replace function public.complete_mafia_game(
  p_session_id uuid,
  p_winner text,
  p_players jsonb,
  p_rounds_played integer,
  p_doctor_saves integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_creator uuid;
  v_token text;
  rec record;
  v_profile_user uuid;
  v_points integer;
  v_reason text;
  v_saved_player uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_winner not in ('mafia', 'detective') then
    raise exception 'invalid winner';
  end if;

  if p_rounds_played < 1 or p_rounds_played > 3 then
    raise exception 'invalid rounds';
  end if;

  select id into v_game_id from public.games where slug = 'mafia' limit 1;
  if v_game_id is null then
    raise exception 'mafia game not found';
  end if;

  insert into public.mafia_game_sessions (id, game_id, created_by, winner, rounds_played, doctor_saves)
  values (p_session_id, v_game_id, auth.uid(), p_winner, p_rounds_played, greatest(0, coalesce(p_doctor_saves, 0)))
  on conflict (id) do nothing;

  select created_by, completion_token
  into v_creator, v_token
  from public.mafia_game_sessions
  where id = p_session_id;

  if v_creator <> auth.uid() then
    raise exception 'only session host may submit';
  end if;

  if v_token is not null then
    raise exception 'session already completed';
  end if;

  v_reason := case when p_winner = 'mafia' then 'mafia_win' else 'detective_win' end;

  for rec in
    select *
    from jsonb_to_recordset(p_players) as x(
      display_name text,
      points integer,
      role text,
      saved_player_id uuid
    )
  loop
    v_points := greatest(0, least(1, coalesce(rec.points, 0)));
    v_saved_player := rec.saved_player_id;

    if v_saved_player is not null and v_points > 0 then
      perform public.record_player_score_event(
        v_saved_player,
        v_game_id,
        v_points,
        v_reason,
        p_session_id
      );
    end if;

    select user_id into v_profile_user
    from public.profiles
    where lower(username) = lower(rec.display_name);

    if v_profile_user is not null and v_points > 0 then
      insert into public.game_stats as gs (
        user_id, game_id, total_points, mafia_games_played, mafia_wins, detective_wins, doctor_saves
      )
      values (
        v_profile_user,
        v_game_id,
        v_points,
        1,
        case when p_winner = 'mafia' and rec.role = 'mafia' then 1 else 0 end,
        case when p_winner = 'detective' and rec.role = 'detective' then 1 else 0 end,
        case when rec.role = 'doctor' then greatest(0, coalesce(p_doctor_saves, 0)) else 0 end
      )
      on conflict (user_id, game_id) do update set
        total_points = gs.total_points + excluded.total_points,
        mafia_games_played = gs.mafia_games_played + 1,
        mafia_wins = gs.mafia_wins + excluded.mafia_wins,
        detective_wins = gs.detective_wins + excluded.detective_wins,
        doctor_saves = gs.doctor_saves + excluded.doctor_saves,
        updated_at = now();
    elsif v_profile_user is not null then
      insert into public.game_stats as gs (user_id, game_id, mafia_games_played, doctor_saves)
      values (
        v_profile_user,
        v_game_id,
        1,
        case when rec.role = 'doctor' then greatest(0, coalesce(p_doctor_saves, 0)) else 0 end
      )
      on conflict (user_id, game_id) do update set
        mafia_games_played = gs.mafia_games_played + 1,
        doctor_saves = gs.doctor_saves + excluded.doctor_saves,
        updated_at = now();
    end if;
  end loop;

  v_token := encode(gen_random_bytes(16), 'hex');
  update public.mafia_game_sessions
  set completed_at = now(), completion_token = v_token
  where id = p_session_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Legacy migration: saved players + score events from game_stats
-- ---------------------------------------------------------------------------
insert into public.saved_players (owner_user_id, display_name, normalized_name, avatar_seed)
select
  p.user_id,
  coalesce(nullif(trim(p.display_name), ''), p.username),
  public.normalize_player_display_name(coalesce(nullif(trim(p.display_name), ''), p.username)),
  coalesce(p.avatar_seed, substr(replace(gen_random_uuid()::text, '-', ''), 1, 16))
from public.profiles p
on conflict (owner_user_id, normalized_name) do nothing;

update public.profiles pr
set self_player_id = sp.id
from public.saved_players sp
where sp.owner_user_id = pr.user_id
  and sp.normalized_name = public.normalize_player_display_name(pr.username)
  and pr.self_player_id is null;

insert into public.player_score_events (
  owner_user_id,
  player_id,
  game_id,
  points,
  reason,
  game_session_id,
  created_at
)
select
  gs.user_id,
  sp.id,
  gs.game_id,
  gs.total_points,
  'legacy_import',
  gen_random_uuid(),
  coalesce(gs.updated_at, now())
from public.game_stats gs
join public.saved_players sp
  on sp.owner_user_id = gs.user_id
  and sp.normalized_name = public.normalize_player_display_name(
    (select username from public.profiles where user_id = gs.user_id)
  )
where gs.total_points > 0
  and not exists (
    select 1
    from public.player_score_events e
    where e.player_id = sp.id
      and e.game_id = gs.game_id
      and e.reason = 'legacy_import'
  );

grant execute on function public.create_saved_player(text) to authenticated;
grant execute on function public.rename_saved_player(uuid, text) to authenticated;
grant execute on function public.set_saved_player_active(uuid, boolean) to authenticated;
grant execute on function public.link_self_saved_player(uuid) to authenticated;
grant execute on function public.get_owner_leaderboard(text, text) to authenticated;


-- ===== 20260323100000_leaderboard_score_fix.sql =====

-- Leaderboard: reliable completion tokens + ensure score RPCs accept saved_player_id

create extension if not exists pgcrypto;

create or replace function public.complete_imposter_round(
  p_round_id uuid,
  p_votes jsonb,
  p_players jsonb,
  p_imposter_names text[],
  p_secret_word text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_creator uuid;
  v_token text;
  rec record;
  v_points integer;
  v_profile_user uuid;
  v_saved_player uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select game_id, created_by, completion_token
  into v_game_id, v_creator, v_token
  from public.game_rounds
  where id = p_round_id;

  if v_game_id is null then
    raise exception 'round not found';
  end if;
  if v_creator <> auth.uid() then
    raise exception 'only round host may submit';
  end if;
  if v_token is not null then
    raise exception 'round already completed';
  end if;

  for rec in
    select *
    from jsonb_to_recordset(p_players) as x(
      display_name text,
      points integer,
      is_imposter boolean,
      saved_player_id uuid
    )
  loop
    v_points := coalesce(rec.points, 0);
    v_saved_player := rec.saved_player_id;

    if v_saved_player is not null and v_points > 0 then
      perform public.record_player_score_event(
        v_saved_player,
        v_game_id,
        v_points,
        'imposter_round',
        p_round_id
      );
    end if;

    select user_id into v_profile_user
    from public.profiles
    where lower(username) = lower(rec.display_name);

    if v_profile_user is not null then
      insert into public.game_stats as gs (
        user_id, game_id, total_points, rounds_played, correct_votes,
        imposter_rounds, imposter_survival_wins
      )
      values (
        v_profile_user,
        v_game_id,
        greatest(0, v_points),
        1,
        case when v_points > 0 and not coalesce(rec.is_imposter, false) then 1 else 0 end,
        case when coalesce(rec.is_imposter, false) then 1 else 0 end,
        case when coalesce(rec.is_imposter, false) and v_points > 0 then 1 else 0 end
      )
      on conflict (user_id, game_id) do update set
        total_points = gs.total_points + excluded.total_points,
        rounds_played = gs.rounds_played + 1,
        correct_votes = gs.correct_votes + excluded.correct_votes,
        imposter_rounds = gs.imposter_rounds + excluded.imposter_rounds,
        imposter_survival_wins = gs.imposter_survival_wins + excluded.imposter_survival_wins,
        updated_at = now();
    end if;
  end loop;

  insert into public.game_round_votes (round_id, voter_name, target_name)
  select p_round_id, v.voter_name, v.target_name
  from jsonb_to_recordset(p_votes) as v(voter_name text, target_name text);

  v_token := replace(gen_random_uuid()::text, '-', '');
  update public.game_rounds
  set completed_at = now(), completion_token = v_token
  where id = p_round_id;
end;
$$;

create or replace function public.complete_mafia_game(
  p_session_id uuid,
  p_winner text,
  p_players jsonb,
  p_rounds_played integer,
  p_doctor_saves integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_creator uuid;
  v_token text;
  rec record;
  v_profile_user uuid;
  v_points integer;
  v_reason text;
  v_saved_player uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_winner not in ('mafia', 'detective') then
    raise exception 'invalid winner';
  end if;

  if p_rounds_played < 1 or p_rounds_played > 3 then
    raise exception 'invalid rounds';
  end if;

  select id into v_game_id from public.games where slug = 'mafia' limit 1;
  if v_game_id is null then
    raise exception 'mafia game not found';
  end if;

  insert into public.mafia_game_sessions (id, game_id, created_by, winner, rounds_played, doctor_saves)
  values (p_session_id, v_game_id, auth.uid(), p_winner, p_rounds_played, greatest(0, coalesce(p_doctor_saves, 0)))
  on conflict (id) do nothing;

  select created_by, completion_token
  into v_creator, v_token
  from public.mafia_game_sessions
  where id = p_session_id;

  if v_creator <> auth.uid() then
    raise exception 'only session host may submit';
  end if;

  if v_token is not null then
    raise exception 'session already completed';
  end if;

  v_reason := case when p_winner = 'mafia' then 'mafia_win' else 'detective_win' end;

  for rec in
    select *
    from jsonb_to_recordset(p_players) as x(
      display_name text,
      points integer,
      role text,
      saved_player_id uuid
    )
  loop
    v_points := greatest(0, least(1, coalesce(rec.points, 0)));
    v_saved_player := rec.saved_player_id;

    if v_saved_player is not null and v_points > 0 then
      perform public.record_player_score_event(
        v_saved_player,
        v_game_id,
        v_points,
        v_reason,
        p_session_id
      );
    end if;

    select user_id into v_profile_user
    from public.profiles
    where lower(username) = lower(rec.display_name);

    if v_profile_user is not null and v_points > 0 then
      insert into public.game_stats as gs (
        user_id, game_id, total_points, mafia_games_played, mafia_wins, detective_wins, doctor_saves
      )
      values (
        v_profile_user,
        v_game_id,
        v_points,
        1,
        case when p_winner = 'mafia' and rec.role = 'mafia' then 1 else 0 end,
        case when p_winner = 'detective' and rec.role = 'detective' then 1 else 0 end,
        case when rec.role = 'doctor' then greatest(0, coalesce(p_doctor_saves, 0)) else 0 end
      )
      on conflict (user_id, game_id) do update set
        total_points = gs.total_points + excluded.total_points,
        mafia_games_played = gs.mafia_games_played + 1,
        mafia_wins = gs.mafia_wins + excluded.mafia_wins,
        detective_wins = gs.detective_wins + excluded.detective_wins,
        doctor_saves = gs.doctor_saves + excluded.doctor_saves,
        updated_at = now();
    elsif v_profile_user is not null then
      insert into public.game_stats as gs (user_id, game_id, mafia_games_played, doctor_saves)
      values (
        v_profile_user,
        v_game_id,
        1,
        case when rec.role = 'doctor' then greatest(0, coalesce(p_doctor_saves, 0)) else 0 end
      )
      on conflict (user_id, game_id) do update set
        mafia_games_played = gs.mafia_games_played + 1,
        doctor_saves = gs.doctor_saves + excluded.doctor_saves,
        updated_at = now();
    end if;
  end loop;

  v_token := replace(gen_random_uuid()::text, '-', '');
  update public.mafia_game_sessions
  set completed_at = now(), completion_token = v_token
  where id = p_session_id;
end;
$$;

-- Backfill score events from legacy game_stats (one row per game per owner player)
insert into public.player_score_events (
  owner_user_id,
  player_id,
  game_id,
  points,
  reason,
  game_session_id,
  created_at
)
select
  gs.user_id,
  sp.id,
  gs.game_id,
  gs.total_points,
  'legacy_import',
  gen_random_uuid(),
  coalesce(gs.updated_at, now())
from public.game_stats gs
join public.saved_players sp
  on sp.owner_user_id = gs.user_id
  and sp.normalized_name = public.normalize_player_display_name(
    (select username from public.profiles where user_id = gs.user_id)
  )
where gs.total_points > 0
  and not exists (
    select 1
    from public.player_score_events e
    where e.player_id = sp.id
      and e.game_id = gs.game_id
      and e.reason = 'legacy_import'
  );

