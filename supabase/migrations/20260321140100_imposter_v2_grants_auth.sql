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
