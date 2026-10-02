import { getDeviceId } from '../lib/deviceId'
import { toUserMessage } from '../lib/errors'
import { roundRatingDisplay } from '../lib/ratingScore'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { GameRatingSummary } from '../types/database'
import { resolveGameDbId } from './games'

const EMPTY_DISTRIBUTION: GameRatingSummary['distribution'] = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
}

export interface GameRatingPayload {
  gameSlug: string
  rating: number
  feedback?: string
}

export type SubmitRatingResult =
  | { ok: true }
  | { ok: false; error: string; duplicate?: boolean; offline?: boolean }

export function emptyRatingSummary(): GameRatingSummary {
  return { average: null, count: 0, distribution: { ...EMPTY_DISTRIBUTION } }
}

export async function getGameRatingSummary(
  gameDbId: string,
): Promise<GameRatingSummary> {
  if (!isSupabaseConfigured || !supabase) {
    return emptyRatingSummary()
  }

  const { data, error } = await supabase
    .from('game_ratings')
    .select('rating')
    .eq('game_id', gameDbId)

  if (error || !data?.length) {
    return emptyRatingSummary()
  }

  const distribution = { ...EMPTY_DISTRIBUTION }
  let total = 0
  for (const row of data) {
    const r = row.rating as number
    if (r >= 1 && r <= 5) {
      distribution[r as 1 | 2 | 3 | 4 | 5] += 1
      total += r
    }
  }
  const count = data.length
  const average = count > 0 ? roundRatingDisplay(total / count) : null

  return { average, count, distribution }
}

export async function submitGameRating(
  payload: GameRatingPayload,
): Promise<SubmitRatingResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      error: "Couldn't send your rating.",
      offline: true,
    }
  }

  if (payload.rating < 1 || payload.rating > 5) {
    return { ok: false, error: 'Please choose a rating from 1 to 5 stars.' }
  }

  const feedback = payload.feedback?.trim()
  if (feedback && feedback.length > 2000) {
    return { ok: false, error: 'Feedback is too long.' }
  }

  const gameId = await resolveGameDbId(payload.gameSlug)
  if (!gameId) {
    return {
      ok: false,
      error: "Couldn't send your rating.",
      offline: true,
    }
  }

  const { error } = await supabase.from('game_ratings').insert({
    game_id: gameId,
    rating: payload.rating,
    feedback: feedback && feedback.length > 0 ? feedback : null,
    device_id: getDeviceId(),
  })

  if (error) {
    const duplicate =
      error.code === '23505' || error.message.includes('duplicate')
    return {
      ok: false,
      error: toUserMessage(
        error,
        "Couldn't send your rating.",
      ),
      duplicate,
    }
  }

  return { ok: true }
}
