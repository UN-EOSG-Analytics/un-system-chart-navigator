'use client';

import { useState, useEffect } from 'react';
import { Entity, EntitiesResponse, EntityFilters } from '@/types/entity';
import { EntitiesAPI } from '@/lib/api';

export function useEntities(
  filters?: EntityFilters & {
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const [data, setData] = useState<EntitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEntities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await EntitiesAPI.getEntities(filters);
        
        if (isMounted) {
          setData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch entities');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEntities();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters?.search,
    filters?.page,
    filters?.limit,
    filters?.group,
    filters?.category,
    filters?.show,
    filters?.ceb_member,
    filters?.head_of_entity_level,
  ]);

  return { data, loading, error, refetch: () => setLoading(true) };
}

export function useEntity(id: string | null) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setEntity(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchEntity = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await EntitiesAPI.getEntity(id);
        
        if (isMounted) {
          setEntity(response);
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
  }, [id]);

  return { entity, loading, error };
}

export function useEntityFilters() {
  const [groups, setGroups] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [headLevels, setHeadLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [groupsData, categoriesData, headLevelsData] = await Promise.all([
          EntitiesAPI.getUniqueValues('group'),
          EntitiesAPI.getUniqueValues('category'),
          EntitiesAPI.getUniqueValues('head_of_entity_level'),
        ]);

        setGroups(groupsData);
        setCategories(categoriesData);
        setHeadLevels(headLevelsData);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  return { groups, categories, headLevels, loading };
}
