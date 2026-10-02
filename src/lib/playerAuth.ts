import {
  supabase,
  isSupabaseConfigured,
  ensureSupabase,
  getSupabasePublicConfig,
} from './supabase'

const PLAYER_EMAIL_DOMAIN = 'sumba.player'

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isValidUsername(username: string): boolean {
  const u = normalizeUsername(username)
  if (u.length < 3 || u.length > 20) return false
  return /^[a-z0-9_]+$/.test(u)
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

function playerEmail(username: string): string {
  return `${normalizeUsername(username)}@${PLAYER_EMAIL_DOMAIN}`
}

function playerPassword(username: string, pin: string): string {
  return `Sb${pin}!${normalizeUsername(username)}`
}

/** User-facing messages — never mention email. */
export function mapPlayerAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('rate limit') || lower.includes('email')) {
    return 'Too many tries. Wait a minute and try again.'
  }
  if (lower.includes('invalid login') || lower.includes('wrong')) {
    return 'Wrong username or PIN.'
  }
  if (lower.includes('already taken') || lower.includes('already registered')) {
    return 'That username is already taken.'
  }
  return message.replace(/email/gi, 'account')
}

async function playerAuthViaFunction(
  action: 'login' | 'register',
  username: string,
  pin: string,
): Promise<void> {
  await ensureSupabase()
  const cfg = getSupabasePublicConfig()
  if (!cfg) {
    throw new Error('SUMBA is offline.')
  }
  const { url: baseUrl, anonKey } = cfg

  const res = await fetch(`${baseUrl}/functions/v1/player-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ action, username: normalizeUsername(username), pin }),
  })

  const body = (await res.json()) as {
    error?: string
    access_token?: string
    refresh_token?: string
  }

  if (!res.ok || body.error) {
    throw new Error(mapPlayerAuthError(body.error ?? 'Could not sign in.'))
  }

  if (!supabase || !body.access_token || !body.refresh_token) {
    throw new Error('Could not start session.')
  }

  const { error } = await supabase.auth.setSession({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  })
  if (error) throw new Error(mapPlayerAuthError(error.message))
}

/** Fallback when Edge Function is not deployed — login only, no public sign-up. */
async function signInDirect(username: string, pin: string): Promise<void> {
  if (!supabase) throw new Error('SUMBA is offline.')
  const { error } = await supabase.auth.signInWithPassword({
    email: playerEmail(username),
    password: playerPassword(username, pin),
  })
  if (error) throw new Error(mapPlayerAuthError(error.message))
}

export async function signUpPlayer(username: string, pin: string) {
  await ensureSupabase()
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('SUMBA is offline. Connect to create an account.')
  }
  try {
    await playerAuthViaFunction('register', username, pin)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not create account.'
    throw new Error(msg)
  }
}

export async function signInPlayer(username: string, pin: string) {
  await ensureSupabase()
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('SUMBA is offline. Connect to sign in.')
  }
  try {
    await playerAuthViaFunction('login', username, pin)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not sign in.'
    if (message.includes('offline') || message.includes('fetch')) {
      await signInDirect(username, pin)
      return
    }
    throw new Error(message)
  }
}

export async function signOutPlayer() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export type UsernameAvailability = 'available' | 'taken' | 'unavailable'

/**
 * Returns whether a username can be registered.
 * `unavailable` = offline / RPC error (must NOT be shown as "taken").
 */
export async function isUsernameAvailable(username: string): Promise<UsernameAvailability> {
  await ensureSupabase()
  if (!isSupabaseConfigured || !supabase) return 'unavailable'
  const normalized = normalizeUsername(username)
  if (!isValidUsername(normalized)) return 'taken'

  const { data, error } = await supabase.rpc('is_username_available', {
    p_username: normalized,
  })

  if (error) {
    if (import.meta.env.DEV) console.warn('is_username_available', error.message)
    return 'unavailable'
  }
  if (data === true) return 'available'
  if (data === false) return 'taken'
  return 'unavailable'
}
