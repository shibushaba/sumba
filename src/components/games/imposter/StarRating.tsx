import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div
      className="flex justify-center gap-2"
      role="radiogroup"
      aria-label="Rate this game from 1 to 5 stars"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            className="rounded-none border-2 border-transparent p-2 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95"
            onClick={() => onChange(star)}
          >
            <Star
              className={`h-10 w-10 sm:h-12 sm:w-12 ${filled ? 'fill-primary text-primary' : 'text-muted'}`}
              aria-hidden
            />
            <span className="sr-only">{star} star</span>
          </button>
        )
      })}
    </div>
  )
}
