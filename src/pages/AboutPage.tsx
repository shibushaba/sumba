import { Link } from 'react-router-dom'
import { SUMBA_VERSION } from '../constants/version'
import { Button } from '../components/ui/Button'

export function AboutPage() {
  return (
    <div className="page-enter w-full px-safe text-center">
      <div className="space-y-6 text-center">
        <p className="font-display text-4xl font-black uppercase text-primary">SUMBA</p>
        <p className="font-display text-2xl font-black uppercase leading-tight">
          Party games for people
          <br />
          who are together.
        </p>
        <p className="text-sm text-muted">Made for game nights.</p>
        <p className="text-xs text-muted">Version {SUMBA_VERSION}</p>
        <p className="text-sm text-muted">
          Created by <span className="font-bold text-foreground">Shabas</span>.
        </p>
      </div>
      <Link to="/" className="mt-10 flex justify-center">
        <Button variant="secondary">Back home</Button>
      </Link>
    </div>
  )
}
