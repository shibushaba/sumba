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
