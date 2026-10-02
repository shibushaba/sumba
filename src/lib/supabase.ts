import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import shippedConfig from '../../public/config.json'

const DEFAULT_SUPABASE_URL = 'https://tpgnjztrebvylzfbiwcr.supabase.co'

export interface PublicSupabaseConfig {
  supabaseUrl: string
  supabaseAnonKey: string
}

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export let isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export let supabase: SupabaseClient | null = null

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

function applyConfig(cfg: PublicSupabaseConfig) {
  const url = cfg.supabaseUrl?.trim() ?? ''
  const key = cfg.supabaseAnonKey?.trim() ?? ''
  if (!url || !key) return false
  supabaseUrl = url
  supabaseAnonKey = key
  isSupabaseConfigured = true
  supabase = createSupabaseClient()
  return true
}

/** Load env from build, then /config.json (written at deploy build). */
export async function initSupabase(): Promise<void> {
  if (isSupabaseConfigured && supabase) return

  if (supabaseUrl && supabaseAnonKey) {
    isSupabaseConfigured = true
    supabase = createSupabaseClient()
    return
  }

  try {
    const base = import.meta.env.BASE_URL ?? '/'
    const configUrl = `${base}config.json`.replace(/\/{2,}/g, '/')
    const res = await fetch(configUrl, { cache: 'no-store' })
    if (res.ok) {
      const json = (await res.json()) as PublicSupabaseConfig
      if (applyConfig(json)) return
    }
  } catch {
    // offline or missing config.json
  }

  if (applyConfig(shippedConfig as PublicSupabaseConfig)) return

  if (!supabaseUrl && DEFAULT_SUPABASE_URL) {
    supabaseUrl = DEFAULT_SUPABASE_URL
  }

  isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
  supabase = isSupabaseConfigured ? createSupabaseClient() : null
}

/** Ensures init ran (safe to call before auth). */
export async function ensureSupabase(): Promise<SupabaseClient | null> {
  await initSupabase()
  return supabase
}

/** Resolved URL + anon key (env, config.json, or bundled public/config.json). */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return { url: supabaseUrl, anonKey: supabaseAnonKey }
}
