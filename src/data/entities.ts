import { Entity } from '@/types/entity';
import entitiesData from '../../public/entities.json';

// Type-safe export of entities data
export const entities: Entity[] = entitiesData as Entity[];

// Utility functions for data access
export function getAllEntities(): Entity[] {
  return entities.filter(entity => entity.on_display === true);
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
    entity.entity_long.toLowerCase().includes(searchTerm) ||
    entity.entity_description?.toLowerCase().includes(searchTerm)
  );
}
