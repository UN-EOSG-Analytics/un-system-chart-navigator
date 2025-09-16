import { Entity } from '@/types/entity';
import entitiesData from '../../public/entities.json';

// Direct raw export (Python pre-processing handles any filtering / cleaning)
export const entities = entitiesData as Entity[];

// Utility functions for data access (no additional filtering)
export function getAllEntities(): Entity[] {
  return entities;
}

export function getEntityBySlug(slug: string): Entity | null {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  return entities.find(entity => {
    const entitySlug = entity.entity
      .toLowerCase()
      .replace(/[^\w\s-]/g, '-')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return entitySlug === decodedSlug;
  }) || null;
}

export function getEntitiesByGroup(group: string): Entity[] {
  return getAllEntities().filter(entity => entity.system_grouping === group);
}

export function searchEntities(query: string): Entity[] {
  const searchTerm = query.toLowerCase();
  return getAllEntities().filter(entity => 
    entity.entity.toLowerCase().includes(searchTerm) ||
    entity.entity_long.toLowerCase().includes(searchTerm)
    // FIXME: what else to search for?
  );
}
