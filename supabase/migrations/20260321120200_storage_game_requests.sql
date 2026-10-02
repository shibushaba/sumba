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
