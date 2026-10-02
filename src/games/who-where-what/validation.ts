import {
  MAX_WHAT_LENGTH,
  MAX_WHERE_LENGTH,
  MAX_WHO_LENGTH,
} from './constants'

export interface WritingFields {
  who: string
  where: string
  what: string
}

export function validateWritingFields(
  fields: WritingFields,
): { ok: true; value: WritingFields } | { ok: false; error: string } {
  const who = fields.who.trim()
  const where = fields.where.trim()
  const what = fields.what.trim()

  if (!who) return { ok: false, error: 'WHO is required.' }
  if (!where) return { ok: false, error: 'WHERE is required.' }
  if (!what) return { ok: false, error: 'WHAT is required.' }

  if (who.length > MAX_WHO_LENGTH) {
    return { ok: false, error: `WHO must be ${MAX_WHO_LENGTH} characters or fewer.` }
  }
  if (where.length > MAX_WHERE_LENGTH) {
    return {
      ok: false,
      error: `WHERE must be ${MAX_WHERE_LENGTH} characters or fewer.`,
    }
  }
  if (what.length > MAX_WHAT_LENGTH) {
    return {
      ok: false,
      error: `WHAT must be ${MAX_WHAT_LENGTH} characters or fewer.`,
    }
  }

  return { ok: true, value: { who, where, what } }
}
