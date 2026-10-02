import type { GameDefinition, GameMetadata } from './types'

const registry = new Map<string, GameDefinition>()

export function registerGame(definition: GameDefinition): void {
  if (registry.has(definition.slug)) {
    throw new Error(`Game already registered: ${definition.slug}`)
  }
  registry.set(definition.slug, definition)
}

export function getGame(slug: string): GameDefinition | undefined {
  return registry.get(slug)
}

export function getGames(): GameDefinition[] {
  return [...registry.values()]
}

export function hasGame(slug: string): boolean {
  return registry.has(slug)
}

export function getGameMetadataList(): GameMetadata[] {
  return getGames().map(({ Play, Details, ...metadata }) => metadata)
}

/** Test-only helper */
export function resetGameRegistryForTests(): void {
  registry.clear()
}
