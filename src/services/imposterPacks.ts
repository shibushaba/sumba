import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface SpecialPackSummary {
  id: string
  name: string
  description: string | null
}

export async function fetchAccessibleSpecialPacks(): Promise<SpecialPackSummary[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase.rpc('get_accessible_special_packs')
  if (error || !data) return []
  return data as SpecialPackSummary[]
}

export async function drawSpecialPackWord(packId: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.rpc('draw_special_pack_word', {
    p_pack_id: packId,
  })
  if (error || !data) return null
  return String(data)
}
