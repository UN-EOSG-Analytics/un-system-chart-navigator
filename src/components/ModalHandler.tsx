'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import EntityModal from './EntityModal';
import { getEntityBySlug } from '@/lib/entities';
import { Entity } from '@/types/entity';
export default function ModalHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entitySlug = searchParams.get('entity');
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entitySlug) {
      setLoading(true);
      setError(null);
      
      try {
        const foundEntity = getEntityBySlug(entitySlug);
        
        if (!foundEntity) {
          console.warn(`Entity "${entitySlug}" not found`);
          setError('Entity not found');
        } else {
          setEntity(foundEntity);
        }
      } catch (err) {
        console.error('Error loading entity:', err);
        setError('Failed to load entity');
      } finally {
        setLoading(false);
      }
    } else {
      setEntity(null);
      setError(null);
      setLoading(false);
    }
  }, [entitySlug]);

  const handleClose = () => {
    router.replace('/', { scroll: false }); // Remove query param, return to home without jumping
  };

  // Don't render anything if no entity slug
  if (!entitySlug) return null;

  return (
    <EntityModal 
      entity={error ? null : entity} 
      onClose={handleClose} 
      loading={loading} 
    />
  );
}
