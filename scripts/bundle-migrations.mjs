import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = path.join(root, 'supabase', 'migrations')
const out = path.join(root, 'supabase', 'BUNDLE_ALL_MIGRATIONS.sql')

const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith('.sql'))
  .sort()

const parts = []
for (const file of files) {
  const body = await readFile(path.join(migrationsDir, file), 'utf8')
  parts.push(`-- ===== ${file} =====\n\n${body}\n`)
}

await writeFile(out, parts.join('\n'), 'utf8')
console.log(`Wrote ${out} (${files.length} migrations)`)
