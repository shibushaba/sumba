update public.games
set
  max_players = 24,
  updated_at = now()
where slug in ('imposter', 'who-where-what', 'mafia');
