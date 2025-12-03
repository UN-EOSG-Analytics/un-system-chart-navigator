import { Entity, EntityFilters } from "@/types/entity";
import entitiesData from "../../public/un-entities.json";
import { createEntitySlug, parseEntityAliases } from "./utils";

// Parse un_principal_organ field (handle both string representations and actual arrays)
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

// Direct import - 180KB JSON file loaded at build time
// Parse un_principal_organ fields on load
export const entities = (entitiesData as Record<string, unknown>[]).map(
  (entity) => ({
    ...entity,
    un_principal_organ: parseUnPrincipalOrgan(entity.un_principal_organ),
  }),
) as Entity[];

// Pre-computed slug-to-entity map for O(1) lookups
export const entitySlugMap = new Map(
  entities.map((entity) => [createEntitySlug(entity.entity), entity]),
);

// Centralized filtering and search function
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

// Simple utility functions
export const getAllEntities = () => entities;

export const getEntityBySlug = (slug: string): Entity | null => {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  return entitySlugMap.get(decodedSlug) || null;
};

export const getEntitiesByGroup = (group: string) => getEntities({ group });

export const searchEntities = (query: string) => getEntities({ search: query });

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
