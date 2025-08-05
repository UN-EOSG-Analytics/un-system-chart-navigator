import { NextResponse } from 'next/server';
import { Entity } from '@/types/entity';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Load entities data from JSON file
    const entitiesPath = path.join(process.cwd(), 'public', 'entities.json');
    const entitiesRaw = fs.readFileSync(entitiesPath, 'utf8');
    const entities = JSON.parse(entitiesRaw) as Entity[];

    return NextResponse.json({ entities }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}