import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('SUMBA error boundary', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
          <p className="font-display text-4xl font-black uppercase text-primary">SUMBA</p>
          <p className="mt-6 font-display text-2xl font-black uppercase">Something went sideways.</p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            The chaos glitched. Head home and try again.
          </p>
          <Link to="/" className="mt-8" onClick={() => this.setState({ hasError: false })}>
            <Button size="lg">Return home</Button>
          </Link>
        </div>
      )
    }

    return this.props.children
  }
}
