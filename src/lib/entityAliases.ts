/**
 * Entity Aliases Resolution
 * 
 * Resolves alternative entity codes/acronyms to their canonical entity identifiers.
 * Aliases are read from the entity data (entity_aliases field in JSON).
 */

import { entities } from './entities';

// Build alias map on import (runs once)
const aliasMap = new Map<string, string>();

entities.forEach(entity => {
    if (!entity.entity_aliases || typeof entity.entity_aliases !== 'string') return;

    try {
        // Parse string format like "['RCS']"
        const parsed = JSON.parse(entity.entity_aliases.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
            parsed.forEach(alias => {
                if (alias && typeof alias === 'string') {
                    // Store in lowercase for case-insensitive matching
                    // Map to lowercase entity code for consistent URL format
                    aliasMap.set(alias.toLowerCase(), entity.entity.toLowerCase());
                }
            });
        }
    } catch {
        // Silently skip invalid formats
    }
});

/**
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
