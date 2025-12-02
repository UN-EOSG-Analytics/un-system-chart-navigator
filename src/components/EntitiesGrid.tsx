"use client";

import {
  normalizePrincipalOrgan,
  principalOrganConfigs,
} from "@/lib/constants";
import { getAllEntities, searchEntities } from "@/lib/entities";
import { Entity } from "@/types/entity";
import { useRouter, useSearchParams } from "next/navigation";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import FilterControls from "./FilterControls";
import PrincipalOrganSection from "./SectionPrincipalOrgan";

const EntitiesGrid = forwardRef<{
  handleReset: () => void;
  toggleGroup: (groupKey: string) => void;
}>((props, ref) => {
  const entities = getAllEntities();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePrincipalOrgans, setActivePrincipalOrgans] = useState<
    Set<string>
  >(new Set(Object.keys(principalOrganConfigs)));
  const [showReviewBorders, setShowReviewBorders] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for filter parameter on mount and when URL changes
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      // Clear the filter parameter from URL after applying it
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  // Add keyboard shortcut to toggle review borders
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if focus is on an input, textarea, select, or button
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        tagName === "button" ||
        target.isContentEditable
      ) {
        return;
      }

      // Toggle review borders on "r" key
      if (e.key.toLowerCase() === "r") {
        setShowReviewBorders((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const toggleGroup = () => {
    // No-op: system grouping removed, keeping for backward compatibility
  };

  const togglePrincipalOrgan = (organKey: string) => {
    setActivePrincipalOrgans((prev) => {
      const allOrgans = Object.keys(principalOrganConfigs);
      const allActive = prev.size === allOrgans.length;

      // If all organs are active (no filter), start a new selection with just this organ
      if (allActive) {
        return new Set([organKey]);
      }

      // Otherwise, toggle the organ in the current selection
      const newOrgans = new Set(prev);

      if (newOrgans.has(organKey)) {
        // Remove the organ
        newOrgans.delete(organKey);
        // If no organs left, show all
        if (newOrgans.size === 0) {
          return new Set(allOrgans);
        }
      } else {
        // Add the organ
        newOrgans.add(organKey);
      }

      return newOrgans;
    });
  };

  const handleEntityClick = (entitySlug: string) => {
    // Update URL without navigation to prevent page jumping
    router.replace(`/?entity=${entitySlug}`, { scroll: false });
  };

  const handleReset = () => {
    // Full reset
    setSearchQuery("");
    setActivePrincipalOrgans(new Set(Object.keys(principalOrganConfigs)));
  };

  const handleFilterReset = () => {
    // Partial reset
    setSearchQuery("");
    setActivePrincipalOrgans(new Set(Object.keys(principalOrganConfigs)));
  };

  useImperativeHandle(ref, () => ({
    handleReset,
    toggleGroup,
  }));

  // Filter and sort entities
  const visibleEntities = (
    searchQuery.trim() ? searchEntities(searchQuery) : entities
  )
    .filter((entity: Entity) => {
      // Filter by principal organ - check if ANY of entity's organs is in active set
      const normalizedOrgans = normalizePrincipalOrgan(
        entity.un_principal_organ,
      );

      if (!normalizedOrgans || normalizedOrgans.length === 0) {
        // Entity has no principal organ - check if "Other" is active
        return activePrincipalOrgans.has("Other");
      }

      // Check if any of the entity's organs is in the active set
      return normalizedOrgans.some((organ) => activePrincipalOrgans.has(organ));
    })
    .sort((a: Entity, b: Entity) => {
      // Sort by principal organ order, then alphabetically
      const aNormalized = normalizePrincipalOrgan(a.un_principal_organ);
      const bNormalized = normalizePrincipalOrgan(b.un_principal_organ);

      // Get primary organ for each entity (first one if array)
      const aOrgan = aNormalized?.[0] || "Other";
      const bOrgan = bNormalized?.[0] || "Other";

      if (aOrgan !== bOrgan) {
        const aConfig = principalOrganConfigs[aOrgan || ""];
        const bConfig = principalOrganConfigs[bOrgan || ""];
        const orderA = aConfig?.order ?? 999;
        const orderB = bConfig?.order ?? 999;
        return orderA - orderB;
      }

      // Within the same organ, sort alphabetically but put "Other" at the end
      const aIsOther = a.entity === "Other";
      const bIsOther = b.entity === "Other";
      if (aIsOther && !bIsOther) return 1;
      if (!aIsOther && bIsOther) return -1;
      return a.entity.localeCompare(b.entity);
    });

  // Group entities by principal organ
  // When filtering, entities appear only in their filtered organ(s)
  // When showing all, entities with multiple organs appear in each organ's group
  const groupedEntities = visibleEntities.reduce(
    (acc: Record<string, Entity[]>, entity: Entity) => {
      const normalized = normalizePrincipalOrgan(entity.un_principal_organ);

      if (!normalized || normalized.length === 0) {
        // No principal organ - add to "Other"
        if (!acc["Other"]) {
          acc["Other"] = [];
        }
        acc["Other"].push(entity);
      } else {
        // Determine which organs to show entity in
        const allOrgans = Object.keys(principalOrganConfigs);
        const isFilterActive = activePrincipalOrgans.size < allOrgans.length;

        if (isFilterActive) {
          // When filtering: only show in active filtered organs
          const organsToShow = normalized.filter((organ) =>
            activePrincipalOrgans.has(organ),
          );
          organsToShow.forEach((organ) => {
            if (!acc[organ]) {
              acc[organ] = [];
            }
            acc[organ].push(entity);
          });
        } else {
          // When showing all: show in all entity's organs
          normalized.forEach((organ) => {
            if (!acc[organ]) {
              acc[organ] = [];
            }
            acc[organ].push(entity);
          });
        }
      }

      return acc;
    },
    {},
  );

  // Get sorted group keys by principal organ
  const sortedGroupKeys = (() => {
    const allOrgans = Object.keys(principalOrganConfigs);
    const isFilterActive = activePrincipalOrgans.size < allOrgans.length;

    if (isFilterActive) {
      // When filtering: only show active organs that have entities
      const organsWithEntities = Object.keys(groupedEntities);
      return organsWithEntities.sort((a, b) => {
        const aConfig = principalOrganConfigs[a];
        const bConfig = principalOrganConfigs[b];
        const orderA = aConfig?.order ?? 999;
        const orderB = bConfig?.order ?? 999;
        return orderA - orderB;
      });
    } else {
      // When showing all: include all principal organs, even those without entities
      const organsWithEntities = Object.keys(groupedEntities);
      const allOrganKeys = Array.from(
        new Set([...allOrgans, ...organsWithEntities]),
      );
      return allOrganKeys.sort((a, b) => {
        const aConfig = principalOrganConfigs[a];
        const bConfig = principalOrganConfigs[b];
        const orderA = aConfig?.order ?? 999;
        const orderB = bConfig?.order ?? 999;
        return orderA - orderB;
      });
    }
  })();

  return (
    <div className="w-full">
      <FilterControls
        activePrincipalOrgans={activePrincipalOrgans}
        onTogglePrincipalOrgan={togglePrincipalOrgan}
        entities={entities}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleFilterReset}
        visibleEntitiesCount={visibleEntities.length}
      />

      {visibleEntities.length === 0 ? (
        <div className="py-20 text-left">
          <p className="text-lg text-gray-500">
            No entities match the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroupKeys.map((groupKey) => {
            const entitiesInGroup = groupedEntities[groupKey] || [];

            return (
              <PrincipalOrganSection
                key={groupKey}
                groupKey={groupKey}
                entities={entitiesInGroup}
                onEntityClick={handleEntityClick}
                showReviewBorders={showReviewBorders}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

EntitiesGrid.displayName = "EntitiesGrid";

export default EntitiesGrid;
