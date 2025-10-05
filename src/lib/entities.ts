import { Entity, EntityFilters } from '@/types/entity';
import entitiesData from '../../public/entities.json';
import budgetDataRaw from '../../public/budget.json';
import { createEntitySlug } from './utils';

// Direct import - 180KB JSON file loaded at build time
export const entities = entitiesData as Entity[];
export const budgetData = budgetDataRaw as Record<string, number>;

// Centralized filtering and search function
export function getEntities(options?: {
    filters?: EntityFilters;
    search?: string;
    group?: string;
}): Entity[] {
    let filtered = [...entities];

    // Apply group filter
    if (options?.group) {
        filtered = filtered.filter(entity => entity.system_grouping === options.group);
    }

    // Apply general filters
    if (options?.filters) {
        filtered = filtered.filter(entity => {
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
        filtered = filtered.filter(entity =>
            entity.entity.toLowerCase().includes(searchTerm) ||
            entity.entity_long.toLowerCase().includes(searchTerm) ||
            (entity.head_of_entity_name && entity.head_of_entity_name.toLowerCase().includes(searchTerm))
        );
    }

    return filtered;
}

// Simple utility functions
export const getAllEntities = () => entities;

export const getEntityBySlug = (slug: string): Entity | null => {
    const decodedSlug = decodeURIComponent(slug).toLowerCase();
    return entities.find(entity => createEntitySlug(entity.entity) === decodedSlug) || null;
};

export const getEntitiesByGroup = (group: string) => getEntities({ group });

export const searchEntities = (query: string) => getEntities({ search: query });

export const getUniqueValues = (field: keyof Entity): string[] => {
    const values = entities
        .map(entity => entity[field])
        .filter((value): value is string =>
            value !== null &&
            value !== undefined &&
            typeof value === 'string'
        )
        .filter((value, index, array) => array.indexOf(value) === index)
        .sort();

    return values;
};

export const formatBudget = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2
    }).format(amount);
};
