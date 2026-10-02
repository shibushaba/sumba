update public.games
set
  max_players = 50,
  updated_at = now()
where slug in ('imposter', 'who-where-what', 'mafia');
