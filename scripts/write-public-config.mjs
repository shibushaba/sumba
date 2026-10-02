/**
 * Writes public/config.json for production.
 * Never wipes an existing anon key when CI has no VITE_* env vars.
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

function readExistingConfig() {
  const outPath = resolve(process.cwd(), 'public', 'config.json')
  if (!existsSync(outPath)) return {}
  try {
    return JSON.parse(readFileSync(outPath, 'utf8'))
  } catch {
    return {}
  }
}

const dot = fromDotEnv()
const existing = readExistingConfig()

const supabaseUrl = (
  process.env.VITE_SUPABASE_URL ||
  dot.url ||
  existing.supabaseUrl ||
  DEFAULT_URL
).trim()

const supabaseAnonKey = (
  process.env.VITE_SUPABASE_ANON_KEY ||
  dot.key ||
  existing.supabaseAnonKey ||
  ''
).trim()

const outPath = resolve(process.cwd(), 'public', 'config.json')
writeFileSync(
  outPath,
  JSON.stringify({ supabaseUrl, supabaseAnonKey }, null, 2) + '\n',
  'utf8',
)

if (!supabaseAnonKey) {
  console.error(
    'write-public-config: missing anon key — set VITE_SUPABASE_ANON_KEY on Vercel or in public/config.json',
  )
  process.exit(1)
}

console.log('write-public-config: wrote public/config.json')
