import { describe, expect, it } from 'vitest'
import { resolveRound } from './resolveRound'

describe('resolveRound', () => {
  it('kills target when not protected', () => {
    const result = resolveRound({
      mafiaTargetId: 'b',
      doctorProtectedPlayerId: 'a',
      doctorProtectionActive: true,
    })
    expect(result.eliminatedPlayerId).toBe('b')
    expect(result.savedPlayerId).toBe(null)
    expect(result.doctorProtectionActive).toBe(true)
    expect(result.doctorProtectedPlayerId).toBe('a')
  })

  it('saves protected target and consumes protection', () => {
    const result = resolveRound({
      mafiaTargetId: 'a',
      doctorProtectedPlayerId: 'a',
      doctorProtectionActive: true,
    })
    expect(result.eliminatedPlayerId).toBeNull()
    expect(result.savedPlayerId).toBe('a')
    expect(result.doctorProtectionActive).toBe(false)
    expect(result.doctorProtectedPlayerId).toBeNull()
  })

  it('keeps protection on another player when someone else dies', () => {
    const result = resolveRound({
      mafiaTargetId: 'b',
      doctorProtectedPlayerId: 'a',
      doctorProtectionActive: true,
    })
    expect(result.eliminatedPlayerId).toBe('b')
    expect(result.doctorProtectedPlayerId).toBe('a')
    expect(result.doctorProtectionActive).toBe(true)
  })
})
