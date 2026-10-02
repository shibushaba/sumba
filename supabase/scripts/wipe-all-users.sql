-- Wipe all Supabase Auth users and dependent player/gameplay data.
-- Preserves catalog: games, game_packs, pack_words, game_ratings, game_requests.

begin;

-- Score log blocks saved_players delete (ON DELETE RESTRICT on player_id).
delete from public.player_score_events;

delete from public.game_round_votes;
delete from public.game_round_players;
delete from public.game_rounds;
delete from public.game_stats;
delete from public.mafia_game_sessions;
delete from public.user_pack_access;
delete from public.saved_players;

-- profiles + admin_profiles cascade from auth.users
delete from auth.users;

commit;
