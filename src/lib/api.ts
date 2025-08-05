import { Entity, EntitiesResponse, EntityFilters } from '@/types/entity';

export class EntitiesAPI {
  static async getEntities(
    filters?: EntityFilters & {
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<EntitiesResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `/api/entities${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch entities: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async getEntity(id: string): Promise<Entity> {
    const url = `/api/entities/${encodeURIComponent(id)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Entity not found');
      }
      throw new Error(`Failed to fetch entity: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async getUniqueValues(field: keyof Entity): Promise<string[]> {
    const { entities } = await this.getEntities({ limit: 1000 });
    const values = entities
      .map(entity => entity[field])
      .filter(value => value !== null && value !== undefined)
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort();
    
    return values as string[];
  }
}
