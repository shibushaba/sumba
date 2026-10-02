import { supabase } from '../lib/supabase'

export async function adminGrantPackAccess(
  packId: string,
  username: string,
  grantedBy: string,
): Promise<string | undefined> {
  if (!supabase) return 'Supabase not configured'

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .ilike('username', username.trim())
    .maybeSingle()

  if (profileError || !profile?.user_id) {
    return 'No player found with that username.'
  }

  const { error } = await supabase.from('user_pack_access').upsert({
    user_id: profile.user_id,
    pack_id: packId,
    granted_by: grantedBy,
  })

  if (error) return error.message
  return undefined
}

export async function adminAddPackWord(
  packId: string,
  word: string,
): Promise<string | undefined> {
  if (!supabase) return 'Supabase not configured'
  const trimmed = word.trim()
  if (!trimmed) return 'Word is required'

  const { error } = await supabase.from('pack_words').insert({
    pack_id: packId,
    word: trimmed,
  })
  if (error) return error.message
  return undefined
}
