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

/**
 * Parse entity aliases from string format like "['RCS','UNDCO']" to array
 */
export function parseEntityAliases(aliasString: string | null | undefined): string[] {
  if (!aliasString || typeof aliasString !== 'string') return [];
  
  try {
    const parsed = JSON.parse(aliasString.replace(/'/g, '"'));
    if (Array.isArray(parsed)) {
      return parsed.filter(alias => typeof alias === 'string');
    }
  } catch {
    // Silently skip invalid formats
  }
  
  return [];
}

/**
 * Generate Airtable contribution form URL with prefilled entity data
 */
export function generateContributeUrl(entity?: Entity): string {
  const baseUrl = '/contribute';
  
  if (!entity) {
    return baseUrl;
  }
  
  const params = new URLSearchParams();
  
  // Add all entity fields as prefill parameters
  params.set('prefill_entity', entity.entity);
  params.set('prefill_entity_long', entity.entity_long);
  params.set('prefill_form_contribution', 'Edit existing Entity Data');
  
  // Add other relevant fields
  if (entity.entity_description) {
    params.set('prefill_entity_description', entity.entity_description);
  }
  if (entity.entity_link) {
    params.set('prefill_entity_link', entity.entity_link);
  }
  if (entity.system_grouping) {
    params.set('prefill_system_grouping', entity.system_grouping);
  }
  if (entity.category) {
    params.set('prefill_category', entity.category);
  }
  if (entity.un_principal_organ) {
    const organValue = Array.isArray(entity.un_principal_organ) 
      ? entity.un_principal_organ.join(', ') 
      : entity.un_principal_organ;
    params.set('prefill_un_principal_organ', organValue);
  }
  if (entity.head_of_entity_name && entity.head_of_entity_name !== 'Not applicable') {
    params.set('prefill_head_of_entity_name', entity.head_of_entity_name);
  }
  if (entity.head_of_entity_title_specific && entity.head_of_entity_title_specific !== 'Not applicable') {
    params.set('prefill_head_of_entity_title_specific', entity.head_of_entity_title_specific);
  }
  
  return `${baseUrl}?${params.toString()}`;
}
