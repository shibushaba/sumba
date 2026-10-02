export function toUserMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (code === '23505') {
      return "You've already rated this game."
    }
  }
  if (error instanceof Error && error.message.includes('23505')) {
    return "You've already rated this game."
  }
  return fallback
}
