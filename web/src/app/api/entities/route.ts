import { NextRequest, NextResponse } from 'next/server';
import { Entity, EntitiesResponse, EntityFilters } from '@/types/entity';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Load entities data from JSON file
    const entitiesPath = path.join(process.cwd(), 'public', 'entities.json');
    const entitiesRaw = fs.readFileSync(entitiesPath, 'utf8');
    const entities = JSON.parse(entitiesRaw) as Entity[];
    
    // Parse query parameters for filtering
    const filters: EntityFilters = {
      group: searchParams.get('group') || undefined,
      category: searchParams.get('category') || undefined,
      show: (searchParams.get('show') as "Yes" | "No") || undefined,
      ceb_member: (searchParams.get('ceb_member') as "Yes" | "No") || undefined,
      head_of_entity_level: searchParams.get('head_of_entity_level') || undefined,
    };
    
    // Filter entities based on query parameters
    let filteredEntities = entities;
    
    if (filters.group) {
      filteredEntities = filteredEntities.filter(entity => 
        entity.group.toLowerCase().includes(filters.group!.toLowerCase())
      );
    }
    
    if (filters.category) {
      filteredEntities = filteredEntities.filter(entity => 
        entity.category.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }
    
    if (filters.show) {
      filteredEntities = filteredEntities.filter(entity => 
        entity.show === filters.show
      );
    }
    
    if (filters.ceb_member) {
      filteredEntities = filteredEntities.filter(entity => 
        entity["ceb_member?"] === filters.ceb_member
      );
    }
    
    if (filters.head_of_entity_level) {
      filteredEntities = filteredEntities.filter(entity => 
        entity.head_of_entity_level.toLowerCase().includes(filters.head_of_entity_level!.toLowerCase())
      );
    }

    // Search functionality
    const search = searchParams.get('search');
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredEntities = filteredEntities.filter(entity => 
        entity.entity.toLowerCase().includes(searchTerm) ||
        entity.entity_long.toLowerCase().includes(searchTerm) ||
        entity.description?.toLowerCase().includes(searchTerm) ||
        entity.combined.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedEntities = filteredEntities.slice(startIndex, endIndex);

    const response: EntitiesResponse = {
      entities: paginatedEntities,
      total: filteredEntities.length,
    };

    return NextResponse.json(response, {
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
