import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../components/admin/AdminAuthProvider'
import { Button } from '../../components/ui/Button'
import { BackButton } from '../../components/ui/BackButton'

export function AdminLoginPage() {
  const { signIn, user, isAdmin, loading } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await signIn(email.trim(), password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'Invalid email or password.')
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-safe pt-safe">
      <BackButton onClick={() => navigate('/')} />
      <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="glass-panel w-full max-w-md border-2 border-foreground p-6 brutal-shadow"
      >
        <h1 className="font-display text-2xl font-black uppercase">Admin login</h1>
        <p className="mt-2 text-sm text-muted">SUMBA internal access</p>
        <label className="mt-6 block text-xs font-bold uppercase text-muted" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full min-h-11 border-2 border-border bg-surface px-3"
        />
        <label className="mt-4 block text-xs font-bold uppercase text-muted" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full min-h-11 border-2 border-border bg-surface px-3"
        />
        {error ? <p className="mt-3 text-sm text-primary" role="alert">{error}</p> : null}
        <Button type="submit" size="lg" fullWidth className="mt-6" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      </div>
    </div>
  )
}
