import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import {
  isValidPin,
  isValidUsername,
  mapPlayerAuthError,
  signInPlayer,
  signOutPlayer,
  signUpPlayer,
} from '../../lib/playerAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { ensureOwnerPlayerRoster } from '../../services/savedPlayers'

interface PlayerProfile {
  username: string
  displayName: string
}

interface PlayerAuthContextValue {
  user: User | null
  profile: PlayerProfile | null
  loading: boolean
  login: (username: string, pin: string) => Promise<string | undefined>
  register: (username: string, pin: string) => Promise<string | undefined>
  logout: () => Promise<void>
}

const PlayerAuthContext = createContext<PlayerAuthContextValue | null>(null)

async function loadProfile(userId: string): Promise<PlayerProfile | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) return null
  return {
    username: data.username,
    displayName: data.display_name ?? data.username,
  }
}

export function PlayerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    void loadProfile(user.id).then((p) => {
      setProfile(p)
      if (p) void ensureOwnerPlayerRoster(p)
    })
  }, [user])

  const login = useCallback(async (username: string, pin: string) => {
    if (!isValidUsername(username)) return 'Username must be 3–20 letters, numbers, or _.'
    if (!isValidPin(pin)) return 'PIN must be exactly 4 digits.'
    try {
      await signInPlayer(username, pin)
      return undefined
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Could not sign in.'
      return mapPlayerAuthError(raw)
    }
  }, [])

  const register = useCallback(async (username: string, pin: string) => {
    if (!isValidUsername(username)) return 'Username must be 3–20 letters, numbers, or _.'
    if (!isValidPin(pin)) return 'PIN must be exactly 4 digits.'
    try {
      await signUpPlayer(username, pin)
      return undefined
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Could not create account.'
      return mapPlayerAuthError(raw)
    }
  }, [])

  const logout = useCallback(async () => {
    await signOutPlayer()
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({ user, profile, loading, login, register, logout }),
    [user, profile, loading, login, register, logout],
  )

  return (
    <PlayerAuthContext.Provider value={value}>{children}</PlayerAuthContext.Provider>
  )
}

export function usePlayerAuth(): PlayerAuthContextValue {
  const ctx = useContext(PlayerAuthContext)
  if (!ctx) {
    throw new Error('usePlayerAuth must be used within PlayerAuthProvider')
  }
  return ctx
}

export function usePlayerAuthOptional(): PlayerAuthContextValue | null {
  return useContext(PlayerAuthContext)
}
