import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { GlassButton } from '../components/ui/glass/GlassButton'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastMessage {
  id: string
  title: string
  body?: string
  actions?: ToastAction[]
}

interface ToastContextValue {
  showToast: (msg: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID()
    setToast({ ...msg, id })
    if (!msg.actions?.length) {
      window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4500)
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className="fixed bottom-[calc(var(--nav-height)+0.75rem)] left-4 right-4 z-50 mx-auto max-w-lg motion-toast-in"
          role="status"
        >
          <div className="glass-panel rounded-[var(--radius-md)] border border-[var(--smb-border-strong)] p-4 shadow-[var(--shadow-glass)]">
            <p className="font-display text-xs font-bold uppercase tracking-wide">
              {toast.title}
            </p>
            {toast.body ? <p className="mt-1 text-sm text-muted">{toast.body}</p> : null}
            {toast.actions?.length ? (
              <div className="mt-3 flex flex-col gap-2">
                {toast.actions.map((a) => (
                  <GlassButton
                    key={a.label}
                    variant={a.label.toLowerCase().includes('not') ? 'secondary' : 'primary'}
                    fullWidth
                    onClick={() => {
                      a.onClick()
                      setToast(null)
                    }}
                  >
                    {a.label}
                  </GlassButton>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast within ToastProvider')
  return ctx
}
