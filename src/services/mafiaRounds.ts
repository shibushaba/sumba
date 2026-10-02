import type { MafiaGameState } from '../games/mafia/types'
import { buildMafiaScorePayload } from '../games/mafia/scoring'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function isAlreadyCompletedError(message: string): boolean {
  return message.toLowerCase().includes('already completed')
}

export async function submitMafiaGame(state: MafiaGameState): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  if (state.scoreSubmitted) return true

  const payload = buildMafiaScorePayload(state)
  if (!payload) return false

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return false

  const { error } = await supabase.rpc('complete_mafia_game', {
    p_session_id: state.sessionId,
    p_winner: payload.winner,
    p_players: payload.players,
    p_rounds_played: payload.rounds_played,
    p_doctor_saves: payload.doctor_saves,
  })

  if (error) {
    console.error(error)
    if (isAlreadyCompletedError(error.message)) return true
    return false
  }

  return true
}
