import { getDeviceId } from '../lib/deviceId'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { GameRequestRow, GameRequestStatus } from '../types/database'

const MAX_AUDIO_BYTES = 5 * 1024 * 1024
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
])

const EXT_BY_MIME: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
}

export interface SubmitGameRequestInput {
  title?: string
  description: string
  audioBlob?: Blob | null
  audioMimeType?: string
}

export type SubmitGameRequestResult =
  | { ok: true }
  | { ok: false; error: string; offline?: boolean }

let lastSubmitAt = 0

export function validateGameRequestInput(input: SubmitGameRequestInput): string | null {
  const description = input.description.trim()
  if (description.length < 10) {
    return 'Please describe your idea in at least 10 characters.'
  }
  if (input.title && input.title.trim().length > 120) {
    return 'Game name is too long.'
  }
  if (input.audioBlob) {
    if (input.audioBlob.size > MAX_AUDIO_BYTES) {
      return 'Audio file is too large (max 5MB).'
    }
    const mime = input.audioMimeType ?? input.audioBlob.type
    if (mime && !ALLOWED_AUDIO_TYPES.has(mime)) {
      return 'Unsupported audio format.'
    }
  }
  return null
}

async function uploadVoiceAudio(blob: Blob, mimeType: string): Promise<string | null> {
  if (!supabase) return null
  const ext = EXT_BY_MIME[mimeType] ?? 'webm'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('game-requests').upload(path, blob, {
    contentType: mimeType,
    upsert: false,
  })
  if (error) return null
  return path
}

export async function submitGameRequest(
  input: SubmitGameRequestInput,
): Promise<SubmitGameRequestResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      error: "You're offline. Please reconnect and try again.",
      offline: true,
    }
  }

  const now = Date.now()
  if (now - lastSubmitAt < 3000) {
    return { ok: false, error: 'Please wait a moment before submitting again.' }
  }

  const validationError = validateGameRequestInput(input)
  if (validationError) {
    return { ok: false, error: validationError }
  }

  let voicePath: string | null = null
  if (input.audioBlob && input.audioBlob.size > 0) {
    const mime = input.audioMimeType ?? input.audioBlob.type ?? 'audio/webm'
    voicePath = await uploadVoiceAudio(input.audioBlob, mime)
    if (!voicePath) {
      return {
        ok: false,
        error: 'Could not upload audio. You can submit text only.',
      }
    }
  }

  const { error } = await supabase.from('game_requests').insert({
    title: input.title?.trim() || null,
    description: input.description.trim(),
    voice_path: voicePath,
    device_id: getDeviceId(),
    status: 'pending',
  })

  if (error) {
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }

  lastSubmitAt = now
  return { ok: true }
}

export async function fetchGameRequests(
  status?: GameRequestStatus | 'all',
): Promise<GameRequestRow[]> {
  if (!supabase) return []
  let query = supabase
    .from('game_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as GameRequestRow[]
}

export async function updateGameRequestStatus(
  id: string,
  status: GameRequestStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Not configured' }
  const { error } = await supabase
    .from('game_requests')
    .update({ status })
    .eq('id', id)
  if (error) return { ok: false, error: 'Something went wrong. Please try again.' }
  return { ok: true }
}

export async function getSignedVoiceUrl(
  voicePath: string,
  expiresInSeconds = 300,
): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from('game-requests')
    .createSignedUrl(voicePath, expiresInSeconds)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}
