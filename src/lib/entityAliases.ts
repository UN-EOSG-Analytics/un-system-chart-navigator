/**
 * Entity Aliases Resolution
 *
 * Resolves alternative entity codes/acronyms to their canonical entity identifiers.
 * Aliases are read from the entity data (entity_aliases field in JSON).
 */

import { entities } from "./entities";
import { parseEntityAliases } from "./utils";

// Build alias map on import (runs once)
const aliasMap = new Map<string, string>();

entities.forEach((entity) => {
  const aliases = parseEntityAliases(entity.entity_aliases);

  // Store each alias in lowercase for case-insensitive matching
  // Map to lowercase entity code for consistent URL format
  aliases.forEach((alias) => {
    aliasMap.set(alias.toLowerCase(), entity.entity.toLowerCase());
  });
}); /**
 * Resolves an entity identifier, returning the canonical entity code if it's an alias,
 * or the original identifier if it's not an alias.
 */
export function resolveEntityAlias(identifier: string): string {
  const normalized = identifier.toLowerCase();
  return aliasMap.get(normalized) || identifier;
}

/**
 * Checks if a given identifier is an alias (not the canonical entity code).
 */
export function isEntityAlias(identifier: string): boolean {
  const normalized = identifier.toLowerCase();
  return aliasMap.has(normalized);
}
