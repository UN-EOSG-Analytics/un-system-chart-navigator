"use client";

import {
  normalizePrincipalOrgan,
  organsToUrlParam,
  principalOrganConfigs,
  urlParamToOrgans,
} from "@/lib/constants";
import { getAllEntities, searchEntities } from "@/lib/entities";
import { Entity } from "@/types/entity";
import { naturalCompareEntities } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import FilterControls from "./FilterControls";
import PrincipalOrganSection from "./SectionPrincipalOrgan";

/**
 * Build URL with current filter state
 * Preserves entity param if present, only adds non-default filter params
 * Uses manual string building to avoid URLSearchParams encoding commas
 */
function buildFilterUrl(
  searchQuery: string,
  activePrincipalOrgans: Set<string>,
  currentEntityParam: string | null,
): string {
  const parts: string[] = [];

  // Preserve entity param if present
  if (currentEntityParam) {
    parts.push(`entity=${encodeURIComponent(currentEntityParam)}`);
  }

  // Add search query if not empty
  if (searchQuery.trim()) {
    parts.push(`q=${encodeURIComponent(searchQuery.trim())}`);
  }

  // Add organs param if not all selected (commas don't need encoding)
  const organsParam = organsToUrlParam(activePrincipalOrgans);
  if (organsParam) {
    parts.push(`organs=${organsParam}`);
  }

  return parts.length > 0 ? `/?${parts.join("&")}` : "/";
}

export default function EntitiesGrid() {
  const entities = getAllEntities();
  const router = useRouter();

  // Initialize state from URL params or defaults (read once on mount)
  const getInitialSearch = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  };
  const getInitialOrgans = () => {
    if (typeof window === "undefined") {
      return new Set(Object.keys(principalOrganConfigs));
    }
    const params = new URLSearchParams(window.location.search);
    const organsParam = params.get("organs");
    return (
      urlParamToOrgans(organsParam) ||
      new Set(Object.keys(principalOrganConfigs))
    );
  };

  const [searchQuery, setSearchQuery] = useState<string>(getInitialSearch);
  const [activePrincipalOrgans, setActivePrincipalOrgans] =
    useState<Set<string>>(getInitialOrgans);
  const [showReviewBorders, setShowReviewBorders] = useState<boolean>(false);

  // Debounce timer for URL updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync URL when filters change (after initial load)
  // Using native history API to avoid Next.js re-renders
  const updateUrl = useCallback((query: string, organs: Set<string>) => {
    // Don't include entity param - filters are separate from modal
    const newUrl = buildFilterUrl(query, organs, null);
    window.history.replaceState(null, "", newUrl);
  }, []);

  // Debounced URL update for search - longer delay to avoid any jank
  const debouncedUpdateUrl = useCallback(
    (query: string, organs: Set<string>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateUrl(query, organs);
      }, 800); // 800ms debounce delay - only update URL after user stops typing
    },
    [updateUrl],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("q") || "";
      const urlOrgans =
        urlParamToOrgans(params.get("organs")) ||
        new Set(Object.keys(principalOrganConfigs));

      setSearchQuery(urlSearch);
      setActivePrincipalOrgans(urlOrgans);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Add keyboard shortcut to toggle review borders
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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

      if (e.key.toLowerCase() === "r") {
        setShowReviewBorders((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedUpdateUrl(query, activePrincipalOrgans);
  };

  const togglePrincipalOrgan = (organKey: string) => {
    setActivePrincipalOrgans((prev) => {
      const allOrgans = Object.keys(principalOrganConfigs);
      const allActive = prev.size === allOrgans.length;

      let newOrgans: Set<string>;

      if (allActive) {
        newOrgans = new Set([organKey]);
      } else {
        newOrgans = new Set(prev);
        if (newOrgans.has(organKey)) {
          newOrgans.delete(organKey);
          if (newOrgans.size === 0) {
            newOrgans = new Set(allOrgans);
          }
        } else {
          newOrgans.add(organKey);
        }
      }

      // Update URL with new organs
      updateUrl(searchQuery, newOrgans);
      return newOrgans;
    });
  };

  const handleEntityClick = (entitySlug: string) => {
    // Store current filter URL for modal to restore on close
    const currentFilterUrl = buildFilterUrl(
      searchQuery,
      activePrincipalOrgans,
      null,
    );
    sessionStorage.setItem("entityModalReturnUrl", currentFilterUrl);

    // Navigate to clean entity URL
    router.replace(`/?entity=${entitySlug}`, { scroll: false });
  };

  const handleReset = () => {
    setSearchQuery("");
    setActivePrincipalOrgans(new Set(Object.keys(principalOrganConfigs)));
    // Clear filters from URL (modal handles its own URL separately)
    router.replace("/", { scroll: false });
  };

  const handleFilterReset = () => {
    handleReset();
  };

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
      return naturalCompareEntities(a.entity, b.entity);
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
    const isSearchActive = searchQuery.trim() !== "";

    if (isFilterActive || isSearchActive) {
      // When filtering or searching: only show organs that have entities
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
        onSearchChange={handleSearchChange}
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
}
