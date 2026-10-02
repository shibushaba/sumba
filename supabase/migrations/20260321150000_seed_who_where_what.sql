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
