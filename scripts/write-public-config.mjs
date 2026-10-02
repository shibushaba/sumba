/**
 * Writes public/config.json for production (Vite bakes env at build time;
 * this file is also fetched at runtime if env vars were missing from the bundle).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_URL = 'https://tpgnjztrebvylzfbiwcr.supabase.co'

function fromDotEnv() {
  const path = resolve(process.cwd(), '.env')
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      out.url = trimmed.slice('VITE_SUPABASE_URL='.length).trim()
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      out.key = trimmed.slice('VITE_SUPABASE_ANON_KEY='.length).trim()
    }
  }
  return out
}

const dot = fromDotEnv()
const supabaseUrl = (process.env.VITE_SUPABASE_URL || dot.url || DEFAULT_URL).trim()
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || dot.key || '').trim()

const outPath = resolve(process.cwd(), 'public', 'config.json')
writeFileSync(
  outPath,
  JSON.stringify({ supabaseUrl, supabaseAnonKey }, null, 2) + '\n',
  'utf8',
)

if (!supabaseAnonKey) {
  console.warn(
    'write-public-config: VITE_SUPABASE_ANON_KEY is empty — set it in .env or Vercel before shipping.',
  )
} else {
  console.log('write-public-config: wrote public/config.json')
}
