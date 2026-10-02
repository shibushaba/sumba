import { roundRatingDisplay } from '../../lib/ratingScore'

interface RatingDisplayProps {
  rating: number | null
  ratingCount: number
  compact?: boolean
}

export function RatingDisplay({
  rating,
  ratingCount,
  compact = false,
}: RatingDisplayProps) {
  if (!ratingCount || rating === null) {
    return <span className="font-bold uppercase text-primary">New</span>
  }

  const label = roundRatingDisplay(rating)
  if (compact) {
    return (
      <span>
        ★ {label}
        <span className="font-normal text-muted"> · {ratingCount} ratings</span>
      </span>
    )
  }

  return (
    <>
      ★ {label}{' '}
      <span className="font-normal text-muted">
        ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
      </span>
    </>
  )
}
