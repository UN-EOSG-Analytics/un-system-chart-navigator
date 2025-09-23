import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Entity } from "@/types/entity"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FIXME: standardize with a variable instead of creating here, to make URLs safe and consistent
// Create a safe, consistent slug from entity names
export function createEntitySlug(entityName: string): string {
  return entityName
    .toLowerCase()
    // Replace special characters and symbols with hyphens
    .replace(/[^\w\s-]/g, '-')
    // Replace multiple spaces or hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

// Find entity by matching original name to slug
export function findEntityBySlug(entities: Entity[], slug: string): Entity | null {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  return entities.find(entity => {
    const entitySlug = createEntitySlug(entity.entity);
    return entitySlug === decodedSlug;
  }) || null;
}
