import type { MafiaPlayer, MafiaRole } from './types'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const SPECIAL_ROLES: MafiaRole[] = ['mafia', 'doctor', 'detective']

export function assignRoles(players: { id: string; name: string }[]): MafiaPlayer[] {
  const shuffled = shuffle(players)
  const special = shuffled.slice(0, SPECIAL_ROLES.length)
  const civilians = shuffled.slice(SPECIAL_ROLES.length)

  const withRoles: MafiaPlayer[] = [
    ...special.map((p, i) => ({
      id: p.id,
      name: p.name,
      role: SPECIAL_ROLES[i],
      alive: true,
    })),
    ...civilians.map((p) => ({
      id: p.id,
      name: p.name,
      role: 'civilian' as MafiaRole,
      alive: true,
    })),
  ]

  return shuffle(withRoles)
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
