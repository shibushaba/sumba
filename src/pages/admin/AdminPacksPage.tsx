import { useEffect, useState } from 'react'
import { useAdminAuth } from '../../components/admin/AdminAuthProvider'
import { supabase } from '../../lib/supabase'
import { adminAddPackWord, adminGrantPackAccess } from '../../services/adminPacks'

interface PackRow {
  id: string
  name: string
  description: string | null
  pack_type: string
  is_active: boolean
}

export function AdminPacksPage() {
  const { user } = useAdminAuth()
  const [packs, setPacks] = useState<PackRow[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [grantPackId, setGrantPackId] = useState('')
  const [grantUsername, setGrantUsername] = useState('')
  const [wordPackId, setWordPackId] = useState('')
  const [newWord, setNewWord] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function reload() {
    if (!supabase) return
    const { data } = await supabase.from('game_packs').select('*').order('name')
    setPacks((data as PackRow[]) ?? [])
  }

  useEffect(() => {
    void reload()
  }, [])

  async function createSpecialPack() {
    if (!supabase || !name.trim()) return
    setMessage(null)
    const { error } = await supabase.from('game_packs').insert({
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      description: description.trim() || null,
      pack_type: 'special',
      is_active: true,
    })
    if (error) {
      setMessage(error.message)
      return
    }
    setName('')
    setDescription('')
    await reload()
  }

  async function grantAccess() {
    if (!user || !grantPackId || !grantUsername.trim()) return
    setMessage(null)
    const err = await adminGrantPackAccess(grantPackId, grantUsername, user.id)
    setMessage(err ?? 'Access granted.')
  }

  async function addWord() {
    if (!wordPackId || !newWord.trim()) return
    setMessage(null)
    const err = await adminAddPackWord(wordPackId, newWord)
    setMessage(err ?? 'Word added.')
    setNewWord('')
  }

  const specialPacks = packs.filter((p) => p.pack_type === 'special')

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-black uppercase">Packs</h1>
      {message ? <p className="text-sm text-primary" role="status">{message}</p> : null}

      <section>
        <h2 className="font-display text-xl font-black uppercase">Core packs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {packs
            .filter((p) => p.pack_type !== 'special')
            .map((p) => (
              <li key={p.id} className="border border-border p-3">
                {p.name} · {p.pack_type} · {p.is_active ? 'active' : 'off'}
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-black uppercase">Special packs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {specialPacks.map((p) => (
            <li key={p.id} className="border border-border p-3">
              <span className="font-bold">{p.name}</span>
              <span className="text-muted"> · {p.is_active ? 'active' : 'off'}</span>
              <span className="mt-1 block font-mono text-xs text-muted">{p.id}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-2 border-dashed border-border p-4">
          <p className="font-display font-black uppercase">Create special pack</p>
          <input
            className="w-full border-2 border-border bg-background px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full border-2 border-border bg-background px-3 py-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="button"
            className="border-2 border-foreground bg-primary px-4 py-2 font-bold uppercase"
            onClick={() => void createSpecialPack()}
          >
            Create
          </button>
        </div>
      </section>

      <section className="space-y-2 border-2 border-border p-4">
        <h2 className="font-display text-lg font-black uppercase">Grant pack access</h2>
        <select
          className="w-full border-2 border-border bg-background px-3 py-2"
          value={grantPackId}
          onChange={(e) => setGrantPackId(e.target.value)}
        >
          <option value="">Select special pack</option>
          {specialPacks.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          className="w-full border-2 border-border bg-background px-3 py-2"
          placeholder="Player username"
          value={grantUsername}
          onChange={(e) => setGrantUsername(e.target.value)}
        />
        <button
          type="button"
          className="border-2 border-foreground px-4 py-2 font-bold uppercase"
          onClick={() => void grantAccess()}
        >
          Grant access
        </button>
      </section>

      <section className="space-y-2 border-2 border-border p-4">
        <h2 className="font-display text-lg font-black uppercase">Add pack word (admin)</h2>
        <select
          className="w-full border-2 border-border bg-background px-3 py-2"
          value={wordPackId}
          onChange={(e) => setWordPackId(e.target.value)}
        >
          <option value="">Select special pack</option>
          {specialPacks.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          className="w-full border-2 border-border bg-background px-3 py-2"
          placeholder="Word (not shown to unauthorized players)"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
        />
        <button
          type="button"
          className="border-2 border-foreground px-4 py-2 font-bold uppercase"
          onClick={() => void addWord()}
        >
          Add word
        </button>
      </section>
    </div>
  )
}
