import { Entity, EntityFilters } from "@/types/entity";
import entitiesData from "../../public/un-entities.json";
import { placeholderEntities } from "./constants";
import { createEntitySlug, parseEntityAliases } from "./utils";

/**
 * Parses the un_principal_organ field from various formats into a standardized array.
 * Handles Airtable's different representations: actual arrays, JSON strings, or single values.
 *
 * @param value - Raw un_principal_organ value from data source
 * @returns Array of principal organ names, or null if invalid/empty
 *
 * @example
 * parseUnPrincipalOrgan(['Security Council']) // Returns: ['Security Council']
 * parseUnPrincipalOrgan("['General Assembly']") // Returns: ['General Assembly']
 * parseUnPrincipalOrgan('Secretariat') // Returns: ['Secretariat']
 */
function parseUnPrincipalOrgan(value: unknown): string[] | null {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    // Handle string representation like "['Security Council']"
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        // Replace single quotes with double quotes for JSON parsing
        const jsonString = value.replace(/'/g, '"');
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    // Single value
    return [value];
  }
  return null;
}

/**
 * Pre-loaded array of all UN System entities.
 * Data is imported from un-entities.json at build time for optimal performance.
 * The un_principal_organ field is parsed on load to ensure consistent array format.
 *
 * @remarks
 * This is loaded once at module initialization (~180KB JSON file).
 * Use this for operations requiring the full dataset.
 */
export const entities: Entity[] = [
  ...((entitiesData as Record<string, unknown>[]).map((entity) => ({
    ...entity,
    un_principal_organ: parseUnPrincipalOrgan(entity.un_principal_organ),
  })) as Entity[]),
  // Hardcoded display-only placeholders — not in Airtable or the dataset.
  // Cast via unknown: only the fields used for rendering are present.
  ...(placeholderEntities as unknown as Entity[]),
];

/**
 * Pre-computed map of entity slugs to entity objects for O(1) lookups.
 * Enables fast entity retrieval by URL-safe slug without array iteration.
 *
 * @example
 * entitySlugMap.get('unicef') // Returns the UNICEF entity object
 * entitySlugMap.get('un-women') // Returns the UN-Women entity object
 */
export const entitySlugMap = new Map(
  entities.map((entity) => [createEntitySlug(entity.entity), entity]),
);

/**
 * Centralized function for filtering and searching entities.
 * Supports multiple filter criteria and text search across entity names, aliases, and leadership.
 *
 * @param options - Optional configuration object
 * @param options.filters - Key-value pairs for exact field matching
 * @param options.search - Text query to search entity names, long names, leadership, and aliases
 * @param options.group - Legacy group filter (deprecated in favor of filters)
 * @returns Filtered array of entities
 *
 * @example
 * // Search for entities
 * getEntities({ search: 'unicef' })
 *
 * // Apply filters
 * getEntities({ filters: { is_ceb_member: true } })
 *
 * // Combine search and filters
 * getEntities({ search: 'women', filters: { is_ceb_member: true } })
 */
export function getEntities(options?: {
  filters?: EntityFilters;
  search?: string;
  group?: string;
}): Entity[] {
  let filtered = [...entities];

  // Apply general filters
  if (options?.filters) {
    filtered = filtered.filter((entity) => {
      return Object.entries(options.filters!).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        const entityValue = entity[key as keyof Entity];
        return entityValue === value;
      });
    });
  }

  // Apply search
  if (options?.search) {
    const searchTerm = options.search.toLowerCase();
    filtered = filtered.filter((entity) => {
      // Search in entity code and long name
      if (
        entity.entity.toLowerCase().includes(searchTerm) ||
        (entity.entity_long &&
          entity.entity_long.toLowerCase().includes(searchTerm)) ||
        (entity.head_of_entity_name &&
          entity.head_of_entity_name.toLowerCase().includes(searchTerm))
      ) {
        return true;
      }

      // Search in aliases
      const aliases = parseEntityAliases(entity.entity_aliases);
      return aliases.some((alias) => alias.toLowerCase().includes(searchTerm));
    });
  }

  return filtered;
}

/**
 * Returns all entities without any filtering.
 * Simple accessor for the full entities array.
 *
 * @returns Complete array of all UN System entities
 */
export const getAllEntities = () => entities;

/**
 * Retrieves a single entity by its URL slug.
 * Uses pre-computed map for O(1) lookup performance.
 *
 * @param slug - URL-safe entity identifier (e.g., "unicef", "un-women")
 * @returns Entity object if found, null otherwise
 *
 * @example
 * getEntityBySlug('unicef') // Returns UNICEF entity
 * getEntityBySlug('invalid') // Returns null
 */
export const getEntityBySlug = (slug: string): Entity | null => {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  return entitySlugMap.get(decodedSlug) || null;
};

/**
 * Retrieves entities filtered by a specific group.
 * Legacy function - consider using getEntities with filters instead.
 *
 * @param group - Group identifier to filter by
 * @returns Array of entities in the specified group
 *
 * @deprecated Use getEntities({ filters: { ... } }) for more flexible filtering
 */
export const getEntitiesByGroup = (group: string) => getEntities({ group });

/**
 * Searches entities by text query across names, descriptions, and aliases.
 * Convenience wrapper around getEntities search functionality.
 *
 * @param query - Search text to match against entity data
 * @returns Array of matching entities
 *
 * @example
 * searchEntities('education') // Finds UNESCO, UNICEF, etc.
 * searchEntities('refugee') // Finds UNHCR
 */
export const searchEntities = (query: string) => getEntities({ search: query });

/**
 * Extracts unique values for a specific entity field.
 * Useful for generating filter options and understanding data distribution.
 *
 * @param field - Entity field key to extract values from
 * @returns Sorted array of unique string values (nulls filtered out)
 *
 * @example
 * getUniqueValues('category') // Returns: ['Funds and Programmes', 'Specialized Agencies', ...]
 * getUniqueValues('head_of_entity_level') // Returns: ['ASG', 'SG', 'USG', ...]
 */
export const getUniqueValues = (field: keyof Entity): string[] => {
  const values = entities
    .map((entity) => entity[field])
    .filter(
      (value): value is string =>
        value !== null && value !== undefined && typeof value === "string",
    )
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort();

  return values;
};
