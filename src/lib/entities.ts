import { Entity } from '@/types/entity';

// Client-side function to fetch entities from API
export async function fetchEntities(): Promise<Entity[]> {
  const response = await fetch('/api/entities');
  if (!response.ok) {
    throw new Error('Failed to fetch entities');
  }
  const data = await response.json();
  return data.entities;
}
