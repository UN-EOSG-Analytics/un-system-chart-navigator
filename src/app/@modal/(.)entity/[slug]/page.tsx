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
        
        // Add a small delay to ensure proper hydration
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const foundEntity = getEntityBySlug(slug);
        
        if (!foundEntity) {
          console.warn(`Entity "${slug}" not found, redirecting to full page`);
          // Use replace instead of push to avoid navigation issues
          router.replace(`/entity/${slug}`);
          return;
        } 
        
        setEntity(foundEntity);
      } catch (error) {
        console.error('Error loading entity:', error);
        setError('Failed to load entity');
        
        // Fallback to regular page on any error
        try {
          const { slug } = await params;
          router.replace(`/entity/${slug}`);
        } catch (e) {
          console.error('Failed to get slug for fallback:', e);
          router.replace('/');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [params, router]);

  const handleClose = () => {
    // Use router.back() but with fallback to home page
    try {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      router.push('/');
    }
  };

  // Show loading state
  if (loading) {
    return <EntityModal entity={null} onClose={handleClose} loading={true} />;
  }

  // Show error state or entity not found
  if (error || !entity) {
    return <EntityModal entity={null} onClose={handleClose} loading={false} />;
  }

  return <EntityModal entity={entity} onClose={handleClose} loading={false} />;
}
