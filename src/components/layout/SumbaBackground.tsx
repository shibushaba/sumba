export function SumbaBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="sumba-bg-base absolute inset-0" />
      <div className="sumba-bg-glow absolute inset-0" />
      <div className="sumba-bg-noise absolute inset-0" />
    </div>
  )
}
