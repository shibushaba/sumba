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
