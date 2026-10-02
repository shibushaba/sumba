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
