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

  useEffect(() => {
    const loadEntity = async () => {
      try {
        const { slug } = await params;
        const foundEntity = getEntityBySlug(slug);
        setEntity(foundEntity);
      } catch (error) {
        console.error('Error loading entity:', error);
        setEntity(null);
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [params]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return <EntityModal entity={null} onClose={handleClose} loading={true} />;
  }

  return <EntityModal entity={entity} onClose={handleClose} loading={false} />;
}
