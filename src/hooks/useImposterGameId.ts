import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useImposterGameId(): string | null {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    void supabase
      .from('games')
      .select('id')
      .eq('slug', 'imposter')
      .maybeSingle()
      .then(({ data }) => setId(data?.id ?? null))
  }, [])

  return id
}
