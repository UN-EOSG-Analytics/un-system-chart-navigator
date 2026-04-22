"use client";

import { principalOrganConfigs } from "@/lib/constants";
import { getAllEntities, searchEntities } from "@/lib/entities";
import { Entity } from "@/types/entity";
import {
  createEntitySlug,
  naturalCompareEntities,
  normalizePrincipalOrgan,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import FilterControls from "./FilterControls";
import { layout } from "@/lib/styles";
import PrincipalOrganSection from "./SectionPrincipalOrgan";

function buildFilterUrl(
  searchQuery: string,
  currentEntityParam: string | null,
  allExpanded?: boolean | undefined,
): string {
  const parts: string[] = [];
  if (currentEntityParam)
    parts.push(`entity=${encodeURIComponent(currentEntityParam)}`);
  if (searchQuery.trim())
    parts.push(`q=${encodeURIComponent(searchQuery.trim())}`);
  if (allExpanded === true) parts.push("expand=true");
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

  const getInitialExpanded = () => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    return params.get("expand") === "true" ? true : undefined;
  };

  const [searchQuery, setSearchQuery] = useState<string>(getInitialSearch);
  const [showReviewBorders, setShowReviewBorders] = useState<boolean>(false);
  const [allExpanded, setAllExpanded] = useState<boolean | undefined>(
    getInitialExpanded,
  );

  // Debounce timer for URL updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const allExpandedRef = useRef(allExpanded);
  useEffect(() => {
    allExpandedRef.current = allExpanded;
  }, [allExpanded]);

  const updateUrl = useCallback((query: string) => {
    const newUrl = buildFilterUrl(query, null, allExpandedRef.current);
    window.history.replaceState(null, "", newUrl);
  }, []);

  const debouncedUpdateUrl = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => updateUrl(query), 800);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newUrl = buildFilterUrl(
      searchQuery,
      params.get("entity"),
      allExpanded,
    );
    window.history.replaceState(null, "", newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allExpanded]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") || "");
      setAllExpanded(params.get("expand") === "true" ? true : undefined);
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
    debouncedUpdateUrl(query);
  };

  const handleEntityClick = (entitySlug: string) => {
    // Cancel any pending debounced URL update — it would strip ?entity= from the URL
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const currentFilterUrl = buildFilterUrl(searchQuery, null);
    sessionStorage.setItem("entityModalReturnUrl", currentFilterUrl);

    // Navigate to clean entity URL
    router.replace(`/?entity=${entitySlug}`, { scroll: false });
  };

  const handleReset = () => {
    setSearchQuery("");
    router.replace("/", { scroll: false });
  };

  const visibleEntities = (
    searchQuery.trim() ? searchEntities(searchQuery) : entities
  ).sort((a: Entity, b: Entity) => {
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
        normalized.forEach((organ) => {
          if (!acc[organ]) acc[organ] = [];
          acc[organ].push(entity);
        });
      }

      return acc;
    },
    {},
  );

  const sortedGroupKeys = (() => {
    const isSearchActive = searchQuery.trim() !== "";
    const allOrgans = Object.keys(principalOrganConfigs);
    const organsWithEntities = Object.keys(groupedEntities);
    const keys = isSearchActive
      ? organsWithEntities
      : Array.from(new Set([...allOrgans, ...organsWithEntities]));
    return keys.sort((a, b) => {
      const orderA = principalOrganConfigs[a]?.order ?? 999;
      const orderB = principalOrganConfigs[b]?.order ?? 999;
      return orderA - orderB;
    });
  })();

  return (
    <div className="w-full">
      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchEnter={() => {
          if (visibleEntities.length === 1) {
            handleEntityClick(createEntitySlug(visibleEntities[0].entity));
          }
        }}
        onReset={handleReset}
        allExpanded={allExpanded}
        onToggleExpandAll={() => setAllExpanded((prev) => prev !== true)}
      />

      {visibleEntities.length === 0 ? (
        <div className={layout.emptyState}>
          <p className={layout.emptyStateText}>
            No entities match the current filters.
          </p>
        </div>
      ) : (
        <div className={layout.organSectionSpacing}>
          {sortedGroupKeys.map((groupKey) => {
            const entitiesInGroup = groupedEntities[groupKey] || [];

            return (
              <PrincipalOrganSection
                key={groupKey}
                groupKey={groupKey}
                entities={entitiesInGroup}
                onEntityClick={handleEntityClick}
                showReviewBorders={showReviewBorders}
                forceExpanded={allExpanded}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
