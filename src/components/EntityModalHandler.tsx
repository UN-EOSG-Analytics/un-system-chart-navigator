"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import EntityModal from "./EntityModal";
import { getEntityBySlug } from "@/lib/entities";
import { Entity } from "@/types/entity";
import { isEntityAlias, resolveEntityAlias } from "@/lib/entityAliases";
export default function ModalHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entitySlug = searchParams.get("entity");
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there's no entity param, clear state
    if (!entitySlug) {
      setEntity(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Canonicalize to lowercase for consistent URLs (SEO best practice)
    const lowercaseSlug = entitySlug.toLowerCase();
    if (entitySlug !== lowercaseSlug) {
      router.replace(`/?entity=${lowercaseSlug}`, { scroll: false });
      return;
    }

    // If the provided slug is an alias, replace the URL with the canonical entity
    // This runs in the client, so it's suitable for static deployments (GitHub Pages)
    if (isEntityAlias(entitySlug)) {
      const canonical = resolveEntityAlias(entitySlug);
      // Replace URL without scrolling to avoid page jump; this will update `entitySlug` and re-run this effect
      router.replace(`/?entity=${canonical}`, { scroll: false });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const foundEntity = getEntityBySlug(entitySlug);

      if (!foundEntity) {
        console.warn(`Entity "${entitySlug}" not found`);
        setError("Entity not found");
      } else {
        setEntity(foundEntity);
      }
    } catch (err) {
      console.error("Error loading entity:", err);
      setError("Failed to load entity");
    } finally {
      setLoading(false);
    }
  }, [entitySlug, router]);

  const handleClose = () => {
    router.replace("/", { scroll: false }); // Remove query param, return to home without jumping
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
