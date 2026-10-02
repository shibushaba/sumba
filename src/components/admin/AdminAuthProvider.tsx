import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { fetchIsAdmin } from '../../services/admin'

interface AdminAuthContextValue {
  session: Session | null
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshAdminStatus: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    const admin = await fetchIsAdmin(user.id)
    setIsAdmin(admin)
  }, [user])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
      },
    )

    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    fetchIsAdmin(user.id).then(setIsAdmin)
  }, [user])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured.' }
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setIsAdmin(false)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      isAdmin,
      loading,
      signIn,
      signOut,
      refreshAdminStatus,
    }),
    [session, user, isAdmin, loading, signIn, signOut, refreshAdminStatus],
  )

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return ctx
}
