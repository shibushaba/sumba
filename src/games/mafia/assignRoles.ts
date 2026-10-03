import { MIN_PLAYERS, MAX_PLAYERS } from './constants'
import { secureShuffle } from '../../utils/random'
import type { MafiaPlayer, MafiaRole } from './types'

const SPECIAL_ROLES: MafiaRole[] = ['mafia', 'doctor', 'detective']

export type RoleAssignments = Record<string, MafiaRole>

export function validateRoleAssignments(
  assignments: RoleAssignments,
  playerIds: string[],
): void {
  const counts = { mafia: 0, doctor: 0, detective: 0, civilian: 0 }
  for (const id of playerIds) {
    const role = assignments[id]
    if (!role) throw new Error(`Missing role for player ${id}`)
    counts[role] += 1
  }
  const civilianExpected = playerIds.length - SPECIAL_ROLES.length
  if (counts.mafia !== 1) throw new Error('Expected exactly 1 Mafia')
  if (counts.doctor !== 1) throw new Error('Expected exactly 1 Doctor')
  if (counts.detective !== 1) throw new Error('Expected exactly 1 Detective')
  if (counts.civilian !== civilianExpected) {
    throw new Error(`Expected ${civilianExpected} Civilians`)
  }
}

/**
 * Randomly assigns roles by shuffling players once, then mapping special roles
 * to the first three shuffled IDs (order: Mafia, Doctor, Detective).
 */
export function assignMafiaRoles(
  players: { id: string }[],
  randomUint32?: () => number,
): RoleAssignments {
  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    throw new Error(`Mafia requires ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const shuffled = secureShuffle(players, randomUint32)
  const assignments: RoleAssignments = {}

  for (let i = 0; i < SPECIAL_ROLES.length; i++) {
    assignments[shuffled[i]!.id] = SPECIAL_ROLES[i]!
  }
  for (let i = SPECIAL_ROLES.length; i < shuffled.length; i++) {
    assignments[shuffled[i]!.id] = 'civilian'
  }

  validateRoleAssignments(
    assignments,
    players.map((p) => p.id),
  )
  return assignments
}

/** Independent shuffle for who passes the phone during role reveal. */
export function createRevealOrder(
  players: { id: string }[],
  randomUint32?: () => number,
): string[] {
  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    throw new Error(`Mafia requires ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }
  const ids = secureShuffle(
    players.map((p) => p.id),
    randomUint32,
  )
  if (new Set(ids).size !== ids.length) {
    throw new Error('Reveal order contains duplicate player IDs')
  }
  if (ids.length !== players.length) {
    throw new Error('Reveal order missing players')
  }
  return ids
}

export function applyRoleAssignments(
  players: { id: string; name: string }[],
  assignments: RoleAssignments,
): MafiaPlayer[] {
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    role: assignments[p.id]!,
    alive: true,
  }))
}

/** Assigns roles while preserving the original player list order. */
export function assignRoles(
  players: { id: string; name: string }[],
  randomUint32?: () => number,
): MafiaPlayer[] {
  const assignments = assignMafiaRoles(players, randomUint32)
  return applyRoleAssignments(players, assignments)
}

export function countRoles(players: MafiaPlayer[]): Record<MafiaRole, number> {
  return players.reduce(
    (acc, p) => {
      acc[p.role] += 1
      return acc
    },
    { mafia: 0, doctor: 0, detective: 0, civilian: 0 },
  )
}
