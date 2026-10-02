-- Username availability: profiles + auth email (orphan auth rows block re-register).

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  with norm as (
    select lower(trim(p_username)) as name
  )
  select not exists (
    select 1
    from public.profiles p
    cross join norm n
    where lower(p.username) = n.name
  )
  and not exists (
    select 1
    from auth.users u
    cross join norm n
    where lower(u.email) = n.name || '@sumba.player'
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

-- Remove auth user with no profile (failed signup) so the username can be reused.
create or replace function public.delete_orphan_player_auth(p_username text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_id uuid;
begin
  v_email := lower(trim(p_username)) || '@sumba.player';
  if v_email = '@sumba.player' or char_length(trim(p_username)) < 3 then
    return;
  end if;

  select u.id into v_id
  from auth.users u
  where lower(u.email) = v_email;

  if v_id is null then
    return;
  end if;

  if exists (select 1 from public.profiles where user_id = v_id) then
    return;
  end if;

  delete from auth.users where id = v_id;
end;
$$;

revoke all on function public.delete_orphan_player_auth(text) from public;
grant execute on function public.delete_orphan_player_auth(text) to service_role;
