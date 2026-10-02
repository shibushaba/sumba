import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

function playerEmail(username: string): string {
  return `${normalizeUsername(username)}@sumba.player`
}

function playerPassword(username: string, pin: string): string {
  return `Sb${pin}!${normalizeUsername(username)}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const { action, username, pin } = await req.json()
    if (!username || !pin) {
      return json({ error: 'Username and PIN are required.' }, 400)
    }

    const normalized = normalizeUsername(username)
    if (normalized.length < 3 || normalized.length > 20 || !/^[a-z0-9_]+$/.test(normalized)) {
      return json({ error: 'Username must be 3–20 letters, numbers, or _.' }, 400)
    }
    if (!/^\d{4}$/.test(String(pin))) {
      return json({ error: 'PIN must be exactly 4 digits.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const email = playerEmail(username)
    const password = playerPassword(username, pin)

    if (action === 'register') {
      const { data: existing } = await admin
        .from('profiles')
        .select('user_id')
        .eq('username', normalized)
        .maybeSingle()

      if (existing) {
        return json({ error: 'That username is already taken.' }, 400)
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username: normalized, display_name: username.trim() },
      })

      if (createError) {
        if (createError.message.toLowerCase().includes('already')) {
          return json({ error: 'That username is already taken.' }, 400)
        }
        return json({ error: 'Could not create account. Try again.' }, 400)
      }

      if (created.user) {
        await admin.from('profiles').upsert({
          user_id: created.user.id,
          username: normalized,
          display_name: username.trim(),
          avatar_seed: normalized,
        })
      }
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: signIn, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signIn.session) {
      const message =
        action === 'login' ? 'Wrong username or PIN.' : 'Could not sign in after creating account.'
      return json({ error: message }, 401)
    }

    return json({
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    })
  } catch (e) {
    return json({ error: 'Something went wrong. Try again.' }, 500)
  }
})

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
