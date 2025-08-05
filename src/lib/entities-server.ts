import { Entity } from '@/types/entity';
import fs from 'fs';
import path from 'path';

// Server-side function to read entities directly from file system
export function getEntities(): Entity[] {
  const entitiesPath = path.join(process.cwd(), 'public', 'entities.json');
  const entitiesRaw = fs.readFileSync(entitiesPath, 'utf8');
  return JSON.parse(entitiesRaw) as Entity[];
}
