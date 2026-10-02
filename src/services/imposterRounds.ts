import type { ImposterRoundState } from '../game-engine/imposter/types'
import { classifyVotes } from '../game-engine/imposter/scoring'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function isAlreadyCompletedError(message: string): boolean {
  return message.toLowerCase().includes('already completed')
}

export async function submitImposterRound(
  gameId: string,
  round: ImposterRoundState,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  if (round.roundSubmitted) return true

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return false

  const roundId = round.roundId

  const { error: roundError } = await supabase.from('game_rounds').insert({
    id: roundId,
    game_id: gameId,
    pack_slug: String(round.packId),
    round_number: round.roundNumber,
    created_by: auth.user.id,
  })

  if (roundError && roundError.code !== '23505') {
    console.error(roundError)
    return false
  }

  const { caught, missed } = classifyVotes(
    round.players,
    round.imposterIds,
    round.votes,
  )
  void caught
  void missed

  const playersPayload = round.pointsEarned.map((row) => {
    const player = round.players.find((p) => p.id === row.playerId)
    return {
      display_name: row.name,
      points: row.points,
      is_imposter: player?.isImposter ?? false,
      saved_player_id: player?.savedPlayerId ?? null,
    }
  })

  const votesPayload = round.votes.map((vote) => {
    const voter = round.players.find((p) => p.id === vote.voterId)
    const target = round.players.find((p) => p.id === vote.targetId)
    return {
      voter_name: voter?.name ?? '',
      target_name: target?.name ?? '',
    }
  })

  const imposterNames = round.players
    .filter((p) => p.isImposter)
    .map((p) => p.name)

  const { error } = await supabase.rpc('complete_imposter_round', {
    p_round_id: roundId,
    p_votes: votesPayload,
    p_players: playersPayload,
    p_imposter_names: imposterNames,
    p_secret_word: round.secretWord,
  })

  if (error) {
    console.error(error)
    if (isAlreadyCompletedError(error.message)) return true
    return false
  }

  return true
}
