/**
 * Bayesian-style weighted rating for fair sorting.
 * priorMean: assumed average for unrated games
 * priorWeight: minimum effective votes before trusting raw average
 */
export function weightedRatingScore(
  average: number,
  count: number,
  priorMean = 4.0,
  priorWeight = 5,
): number {
  if (count <= 0) return priorMean
  return (count * average + priorWeight * priorMean) / (count + priorWeight)
}

export function roundRatingDisplay(value: number): number {
  return Math.round(value * 10) / 10
}
