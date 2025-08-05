'use client';

import { useEffect, useState } from 'react';
import { Entity } from '@/types/entity';
import { fetchEntities } from '@/lib/entities';
import { findEntityBySlug } from '@/lib/utils';

interface UseEntitiesOptions {
  limit?: number;
}

interface UseEntitiesResult {
  data: { entities: Entity[] } | null;
  loading: boolean;
  error: string | null;
}

export function useEntities(options: UseEntitiesOptions = {}): UseEntitiesResult {
  const { limit } = options;
  const [data, setData] = useState<{ entities: Entity[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const entities = await fetchEntities();
        
        // Apply limit if specified
        const limitedEntities = limit ? entities.slice(0, limit) : entities;
        
        setData({ entities: limitedEntities });
      } catch (err) {
        console.error('Error loading entities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load entities');
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [limit]);

  return { data, loading, error };
}

export function useEntity(slug: string | null) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setEntity(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchEntity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const entities = await fetchEntities();
        const foundEntity = findEntityBySlug(entities, slug);
        
        if (isMounted) {
          setEntity(foundEntity);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch entity');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEntity();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { entity, loading, error };
}
