'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Entity } from '@/types/entity';
import EntityModal from '@/components/EntityModal';
import { getEntityBySlug } from '@/data/entities';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function InterceptedEntityPage({ params }: Props) {
  const router = useRouter();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntity = async () => {
      try {
        const { slug } = await params;
        const foundEntity = getEntityBySlug(slug);
        
        if (!foundEntity) {
          setError(`Entity "${slug}" not found`);
          // Fallback to regular page on error
          setTimeout(() => {
            router.push(`/entity/${slug}`);
          }, 1000);
        } else {
          setEntity(foundEntity);
        }
      } catch (error) {
        console.error('Error loading entity:', error);
        setError('Failed to load entity');
        // Fallback to regular page on error
        const { slug } = await params;
        setTimeout(() => {
          router.push(`/entity/${slug}`);
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [params, router]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return <EntityModal entity={null} onClose={handleClose} loading={true} />;
  }

  if (error) {
    return <EntityModal entity={null} onClose={handleClose} loading={false} />;
  }

  return <EntityModal entity={entity} onClose={handleClose} loading={false} />;
}
