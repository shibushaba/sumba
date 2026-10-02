import type { MafiaPlayer } from './types'

/** Mafia → Doctor (if alive) → Detective → Civilians (living only). */
export function buildRoundActionQueue(
  players: MafiaPlayer[],
  doctorAlive = true,
): string[] {
  const living = players.filter((p) => p.alive)
  const mafia = living.find((p) => p.role === 'mafia')
  const doctor = living.find((p) => p.role === 'doctor')
  const detective = living.find((p) => p.role === 'detective')
  const civilians = living.filter((p) => p.role === 'civilian')

  const queue: string[] = []
  if (mafia) queue.push(mafia.id)
  if (doctor && doctorAlive && doctor.alive) queue.push(doctor.id)
  if (detective) queue.push(detective.id)
  for (const c of civilians) queue.push(c.id)
  return queue
}

export function livingPlayersExcept(
  players: MafiaPlayer[],
  excludeIds: string[],
): MafiaPlayer[] {
  const exclude = new Set(excludeIds)
  return players.filter((p) => p.alive && !exclude.has(p.id))
}
