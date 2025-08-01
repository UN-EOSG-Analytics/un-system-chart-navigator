import { NextRequest, NextResponse } from 'next/server';
import { Entity } from '@/types/entity';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Load entities data from JSON file
    const entitiesPath = path.join(process.cwd(), 'public', 'entities.json');
    const entitiesRaw = fs.readFileSync(entitiesPath, 'utf8');
    const entities = JSON.parse(entitiesRaw) as Entity[];
    
    // Find entity by short name (entity field) or full name
    const entity = entities.find(e => 
      e.entity.toLowerCase() === id.toLowerCase() ||
      e.entity_long.toLowerCase() === id.toLowerCase()
    );
    
    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entity, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching entity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
