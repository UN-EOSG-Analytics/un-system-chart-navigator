"use client";

import {
  categoryOrderByPrincipalOrgan,
  getSortedCategories,
  getSortedSubcategories,
  getSystemGroupingStyle,
  normalizePrincipalOrgan,
  principalOrganConfigs,
  subcategoryOrderByPrincipalOrgan,
  systemGroupingStyles,
} from "@/lib/constants";
import { getAllEntities, searchEntities } from "@/lib/entities";
import { Entity } from "@/types/entity";
import { useRouter, useSearchParams } from "next/navigation";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import EntityCard from "./EntityCard";
import FilterControls from "./FilterControls";

const EntitiesGrid = forwardRef<{
  handleReset: () => void;
  toggleGroup: (groupKey: string) => void;
}>((props, ref) => {
  const entities = getAllEntities();
  const [activeGroups, setActiveGroups] = useState<Set<string>>(
    new Set(Object.keys(systemGroupingStyles)),
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupingMode, setGroupingMode] = useState<
    "system" | "principal-organ"
  >("principal-organ");
  const [activePrincipalOrgans, setActivePrincipalOrgans] = useState<
    Set<string>
  >(new Set(Object.keys(principalOrganConfigs)));
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for filter parameter on mount and when URL changes
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      setActiveGroups(new Set([filterParam]));
      setSearchQuery("");
      // Clear the filter parameter from URL after applying it
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  const toggleGroup = (groupKey: string) => {
    setActiveGroups((prev) => {
      const allGroups = Object.keys(systemGroupingStyles);
      const allActive = prev.size === allGroups.length;

      // If all groups are active (no filter), start a new selection with just this group
      if (allActive) {
        return new Set([groupKey]);
      }

      // Otherwise, toggle the group in the current selection
      const newGroups = new Set(prev);

      if (newGroups.has(groupKey)) {
        // Remove the group
        newGroups.delete(groupKey);
        // If no groups left, show all
        if (newGroups.size === 0) {
          return new Set(allGroups);
        }
      } else {
        // Add the group
        newGroups.add(groupKey);
      }

      return newGroups;
    });
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
    // Full reset including mode - used when clicking home header
    setSearchQuery("");
    setActiveGroups(new Set(Object.keys(systemGroupingStyles)));
    setActivePrincipalOrgans(new Set(Object.keys(principalOrganConfigs)));
    setGroupingMode("system");
  };

  const handleFilterReset = () => {
    // Partial reset preserving mode - used by reset button
    setSearchQuery("");
    setActiveGroups(new Set(Object.keys(systemGroupingStyles)));
    setActivePrincipalOrgans(new Set(Object.keys(principalOrganConfigs)));
    // Don't reset grouping mode - preserve user's view preference
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
      // Filter by system grouping - always show if system_grouping is null/empty
      const systemGrouping = entity.system_grouping || "Unspecified";
      if (!activeGroups.has(systemGrouping)) return false;

      // Filter by principal organ - check if entity's organ is in active set
      const normalizedOrgan = normalizePrincipalOrgan(
        entity.un_principal_organ,
      );
      const organToCheck = Array.isArray(normalizedOrgan)
        ? normalizedOrgan[0] || "Other"
        : normalizedOrgan || "Other";
      if (!activePrincipalOrgans.has(organToCheck)) return false;

      return true;
    })
    .sort((a: Entity, b: Entity) => {
      if (groupingMode === "principal-organ") {
        // Sort by principal organ order, then system grouping, then alphabetically
        const aNormalized = normalizePrincipalOrgan(a.un_principal_organ);
        const bNormalized = normalizePrincipalOrgan(b.un_principal_organ);

        // Get primary organ for each entity (first one if array)
        const aOrgan = Array.isArray(aNormalized)
          ? aNormalized[0]
          : aNormalized;
        const bOrgan = Array.isArray(bNormalized)
          ? bNormalized[0]
          : bNormalized;

        if (aOrgan !== bOrgan) {
          const aConfig = principalOrganConfigs[aOrgan || ""];
          const bConfig = principalOrganConfigs[bOrgan || ""];
          const orderA = aConfig?.order ?? 999;
          const orderB = bConfig?.order ?? 999;
          return orderA - orderB;
        }

        // Within the same organ, sort by system grouping first
        const aGrouping = a.system_grouping || "Unspecified";
        const bGrouping = b.system_grouping || "Unspecified";
        if (aGrouping !== bGrouping) {
          const orderA = getSystemGroupingStyle(aGrouping).order;
          const orderB = getSystemGroupingStyle(bGrouping).order;
          return orderA - orderB;
        }

        // Within the same system grouping, sort alphabetically but put "Other" at the end
        const aIsOther = a.entity === "Other";
        const bIsOther = b.entity === "Other";
        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;
        return a.entity.localeCompare(b.entity);
      } else {
        // Sort by system grouping order, then alphabetically
        const aGrouping = a.system_grouping || "Unspecified";
        const bGrouping = b.system_grouping || "Unspecified";
        if (aGrouping !== bGrouping) {
          const orderA = getSystemGroupingStyle(aGrouping).order;
          const orderB = getSystemGroupingStyle(bGrouping).order;
          return orderA - orderB;
        }

        // Within the same group, sort alphabetically but put "Other" at the end
        const aIsOther = a.entity === "Other";
        const bIsOther = b.entity === "Other";
        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;
        return a.entity.localeCompare(b.entity);
      }
    });

  // Group entities based on current grouping mode
  const groupedEntities = visibleEntities.reduce(
    (acc: Record<string, Entity[]>, entity: Entity) => {
      let groupKey: string;

      if (groupingMode === "principal-organ") {
        const normalized = normalizePrincipalOrgan(entity.un_principal_organ);
        // Use first organ if array, or the organ itself, or "N/A" if null
        if (Array.isArray(normalized)) {
          groupKey = normalized[0] || "N/A";
        } else if (normalized === null || normalized === "") {
          groupKey = "N/A";
        } else {
          groupKey = normalized;
        }
      } else {
        groupKey = entity.system_grouping || "Unspecified";
      }

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(entity);
      return acc;
    },
    {},
  );

  // Get sorted group keys based on the current grouping mode
  const sortedGroupKeys = Object.keys(groupedEntities).sort((a, b) => {
    if (groupingMode === "principal-organ") {
      const aConfig = principalOrganConfigs[a];
      const bConfig = principalOrganConfigs[b];
      const orderA = aConfig?.order ?? 999;
      const orderB = bConfig?.order ?? 999;
      return orderA - orderB;
    } else {
      const orderA = getSystemGroupingStyle(a).order;
      const orderB = getSystemGroupingStyle(b).order;
      return orderA - orderB;
    }
  });

  return (
    <div className="w-full">
      {/* Search and Filter Controls */}
      <FilterControls
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        groupingMode={groupingMode}
        onGroupingModeChange={setGroupingMode}
        activePrincipalOrgans={activePrincipalOrgans}
        onTogglePrincipalOrgan={togglePrincipalOrgan}
        entities={entities}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleFilterReset}
        visibleEntitiesCount={visibleEntities.length}
      />

      {/* Entities Grid with Group Headings */}
      {visibleEntities.length === 0 ? (
        <div className="py-20 text-left">
          <p className="text-lg text-gray-500">
            No entities match the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroupKeys.map((groupKey) => {
            // Get the appropriate style/label based on grouping mode
            const groupLabel =
              groupingMode === "principal-organ"
                ? principalOrganConfigs[groupKey]?.label || groupKey
                : getSystemGroupingStyle(groupKey).label;

            // For principal organ mode, group entities by category
            const entitiesInGroup = groupedEntities[groupKey];

            if (groupingMode === "principal-organ") {
              // Get principal organ colors
              const organConfig = principalOrganConfigs[groupKey];
              const organBgColor = organConfig?.bgColor || "bg-gray-300";
              const organTextColor = organConfig?.textColor || "text-black";

              // Group by category
              const categorizedEntities = entitiesInGroup.reduce(
                (acc: Record<string, Entity[]>, entity: Entity) => {
                  const category = entity.category || "N/A";
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(entity);
                  return acc;
                },
                {},
              );

              const sortedCategories = getSortedCategories(
                Object.keys(categorizedEntities),
                groupKey, // Pass the principal organ as context
              );

              // Check if categories are defined in constants for this organ
              const hasDefinedCategories = categoryOrderByPrincipalOrgan[groupKey] !== undefined &&
                Object.keys(categoryOrderByPrincipalOrgan[groupKey]).length > 0;

              return (
                <div
                  key={groupKey}
                  className="animate-in fade-in slide-in-from-bottom-4"
                >
                  {/* Principal Organ Heading */}
                  <div className="mb-4">
                    <div className="mb-1 h-px bg-gradient-to-r from-gray-400 via-gray-200 to-transparent"></div>
                    <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                      {groupLabel}
                    </h2>
                  </div>

                  {/* If categories are not defined, show entities directly without category headers */}
                  {!hasDefinedCategories ? (
                    <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                      {entitiesInGroup.map((entity: Entity) => (
                        <EntityCard
                          key={entity.entity}
                          entity={entity}
                          onEntityClick={handleEntityClick}
                          customBgColor={organBgColor}
                          customTextColor={organTextColor}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Categories within this Principal Organ */
                    <div className="space-y-4">
                    {sortedCategories.map((category) => {
                      // Group entities by subcategory within this category
                      const subcategorizedEntities = categorizedEntities[
                        category
                      ].reduce(
                        (acc: Record<string, Entity[]>, entity: Entity) => {
                          const subcategory = entity.subcategory || "";
                          if (!acc[subcategory]) {
                            acc[subcategory] = [];
                          }
                          acc[subcategory].push(entity);
                          return acc;
                        },
                        {},
                      );

                      const subcategories = Object.keys(subcategorizedEntities);
                      const hasSubcategories =
                        subcategories.length > 1 ||
                        (subcategories.length === 1 && subcategories[0] !== "");

                      // Check if subcategories are defined in constants for this organ
                      const hasDefinedSubcategories = subcategoryOrderByPrincipalOrgan[groupKey] !== undefined;
                      
                      // Special rendering when subcategories are defined: show all defined subcategories with headers
                      if (hasDefinedSubcategories) {
                        // Get all defined subcategories from constants
                        const definedSubcategories = Object.keys(
                          subcategoryOrderByPrincipalOrgan[groupKey] || {}
                        ).filter(key => key !== ""); // Exclude empty string placeholder
                        
                        // Use all defined subcategories, not just ones with entities
                        const allSubcategories = Array.from(
                          new Set([...definedSubcategories])
                        );
                        const sortedAllSubcategories = getSortedSubcategories(
                          allSubcategories,
                          groupKey,
                        );

                        // For Security Council, skip category header
                        if (groupKey === "Security Council (SC)") {
                          return (
                            <div key={category} className="space-y-3">
                              {sortedAllSubcategories.map((subcategory) => {
                                const entitiesInSubcategory = subcategorizedEntities[subcategory] || [];
                                
                                return (
                                  <div key={subcategory || "none"}>
                                    {subcategory && (
                                      <h3 className="subcategory-header mb-1.5 text-sm font-normal text-gray-500 sm:text-base">
                                        {subcategory}
                                      </h3>
                                    )}
                                    {entitiesInSubcategory.length > 0 && (
                                      <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                                        {entitiesInSubcategory.map(
                                          (entity: Entity) => (
                                            <EntityCard
                                              key={entity.entity}
                                              entity={entity}
                                              onEntityClick={handleEntityClick}
                                              customBgColor={organBgColor}
                                              customTextColor={organTextColor}
                                            />
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        
                        // For other organs with defined subcategories, show category header then subcategories
                        return (
                          <div key={category}>
                            {/* Category H2 Header */}
                            <h2 className="category-header mb-2 text-base font-medium text-gray-600 sm:text-lg">
                              {category}
                            </h2>
                            
                            {/* All defined subcategories */}
                            <div className="space-y-3">
                              {sortedAllSubcategories.map((subcategory) => {
                                const entitiesInSubcategory = subcategorizedEntities[subcategory] || [];
                                
                                return (
                                  <div key={subcategory || "none"}>
                                    {subcategory && (
                                      <h3 className="subcategory-header mb-1.5 text-sm font-normal text-gray-500 sm:text-base">
                                        {subcategory}
                                      </h3>
                                    )}
                                    {entitiesInSubcategory.length > 0 && (
                                      <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                                        {entitiesInSubcategory.map(
                                          (entity: Entity) => (
                                            <EntityCard
                                              key={entity.entity}
                                              entity={entity}
                                              onEntityClick={handleEntityClick}
                                              customBgColor={organBgColor}
                                              customTextColor={organTextColor}
                                            />
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else {
                        // Standard rendering for organs without defined subcategories
                        // Use custom sorting for subcategories
                        const sortedSubcategories = getSortedSubcategories(
                          subcategories,
                          groupKey,
                        );

                        return (
                          <div key={category}>
                            {/* Category H2 Header */}
                            <h2 className="category-header mb-2 text-base font-medium text-gray-600 sm:text-lg">
                              {category}
                            </h2>

                            {/* Direct grid only - no subcategories shown */}
                            <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                              {categorizedEntities[category].map(
                                (entity: Entity) => (
                                  <EntityCard
                                    key={entity.entity}
                                    entity={entity}
                                    onEntityClick={handleEntityClick}
                                    customBgColor={organBgColor}
                                    customTextColor={organTextColor}
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        );
                      }
                    })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={groupKey}
                className="animate-in fade-in slide-in-from-bottom-4"
              >
                {/* Group Heading */}
                <div className="mb-4">
                  <div className="mb-1 h-px bg-gradient-to-r from-gray-400 via-gray-200 to-transparent"></div>
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {groupLabel}
                  </h2>
                </div>

                {/* Group Grid */}
                <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                  {groupedEntities[groupKey].map((entity: Entity) => (
                    <EntityCard
                      key={entity.entity}
                      entity={entity}
                      onEntityClick={handleEntityClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

EntitiesGrid.displayName = "EntitiesGrid";

export default EntitiesGrid;
