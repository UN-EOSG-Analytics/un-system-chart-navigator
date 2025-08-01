'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Entity } from '@/types/entity';
import EntityModal from '@/components/EntityModal';

interface Props {
  params: { slug: string };
}

export default function InterceptedEntityPage({ params }: Props) {
  const router = useRouter();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        // Await params before accessing slug
        const { slug } = await params;
        // Decode the slug to get the entity name
        const entityName = decodeURIComponent(slug);
        const response = await fetch(`/api/entities`);
        const data = await response.json();
        
        // Find entity by name
        const foundEntity = data.entities.find((e: Entity) => 
          e.entity.toLowerCase().replace(/\s+/g, '-') === entityName.toLowerCase()
        );
        
        setEntity(foundEntity || null);
      } catch (error) {
        console.error('Error fetching entity:', error);
        setEntity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [params]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return <EntityModal entity={null} onClose={handleClose} loading={true} />;
  }

  return <EntityModal entity={entity} onClose={handleClose} loading={false} />;
}
