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
