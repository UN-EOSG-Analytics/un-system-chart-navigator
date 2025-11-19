"use client";

import FilterDropdown from "@/components/FilterDropdown";
import SearchInput from "@/components/SearchInput";
import ResetButton from "@/components/ResetButton";
import ViewToggle from "@/components/ViewToggle";
import {
  getSortedPrincipalOrgans,
  principalOrganConfigs,
  getSortedSystemGroupings,
  systemGroupingStyles,
} from "@/lib/constants";
import { Entity } from "@/types/entity";
import { Boxes, ChevronDown, ChevronUp, Filter, Landmark } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FilterControlsProps {
  activeGroups: Set<string>;
  onToggleGroup: (groupKey: string) => void;
  groupingMode: "system" | "principal-organ";
  onGroupingModeChange: (mode: "system" | "principal-organ") => void;
  activePrincipalOrgans: Set<string>;
  onTogglePrincipalOrgan: (organ: string) => void;
  entities: Entity[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  visibleEntitiesCount: number;
}

export default function FilterControls({
  activeGroups,
  onToggleGroup,
  groupingMode,
  onGroupingModeChange,
  activePrincipalOrgans,
  onTogglePrincipalOrgan,
  entities,
  searchQuery,
  onSearchChange,
  onReset,
  visibleEntitiesCount,
}: FilterControlsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPrincipalOrganPopoverOpen, setIsPrincipalOrganPopoverOpen] =
    useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Refs for search inputs
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input on mount
  useEffect(() => {
    // Focus desktop search on larger screens, mobile on smaller
    if (window.innerWidth >= 1024) {
      desktopSearchRef.current?.focus();
    } else {
      mobileSearchRef.current?.focus();
    }
  }, []);

  // Count entities for each group
  const groupCounts = entities.reduce(
    (acc, entity) => {
      const grouping = entity.system_grouping || "Unspecified";
      acc[grouping] = (acc[grouping] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Check if all groups are active (showing all) or only specific ones are filtered
  const allGroupsActive =
    activeGroups.size === Object.keys(systemGroupingStyles).length;

  // Check if all principal organs are active
  const allPrincipalOrgansActive =
    activePrincipalOrgans.size === Object.keys(principalOrganConfigs).length;

  // Sort groups by their order
  const sortedGroups = getSortedSystemGroupings();

  // Check if reset is needed
  const isResetNeeded =
    searchQuery.trim() !== "" || !allGroupsActive || !allPrincipalOrgansActive;

  // Get filter button text
  const getFilterText = () => {
    if (allGroupsActive) {
      return "Filter by System Group...";
    }
    const count = activeGroups.size;
    return `${count} Group${count !== 1 ? "s" : ""} selected`;
  };

  // Get principal organ filter button text
  const getPrincipalOrganFilterText = () => {
    if (allPrincipalOrgansActive) {
      return "Filter by Principal Organ...";
    }
    const count = activePrincipalOrgans.size;
    return `${count} Organ${count !== 1 ? "s" : ""} selected`;
  };

  return (
    <div className="mb-4 flex flex-col gap-3 lg:mb-6">
      {/* Search Bar - Mobile/Tablet Only (separate) */}
      <div className="mt-2 lg:hidden">
        <SearchInput
          ref={mobileSearchRef}
          id="entity-search"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search for UN entities..."
          ariaLabel="Search for UN entities by keyword"
        />
      </div>

      {/* Mobile/Tablet: Toggle Filters Button + Reset Button Row */}
      <div className="-mt-1 mb-0.5 flex items-center justify-between gap-2 lg:hidden">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className={`flex h-10 w-auto touch-manipulation items-center gap-2 px-3 text-sm transition-colors ${
            !allGroupsActive || !allPrincipalOrgansActive
              ? "text-un-blue"
              : "text-gray-500"
          } `}
          aria-label={filtersExpanded ? "Hide filters" : "Show filters"}
          aria-expanded={filtersExpanded}
        >
          <Filter className="h-4 w-4" />
          <span>{filtersExpanded ? "Hide" : "Show"} Filters</span>
          {filtersExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Reset Button - Mobile/Tablet - only show when there's something to reset */}
        {isResetNeeded && <ResetButton onClick={onReset} showLabel={true} />}
      </div>

      {/* Desktop: Search + Filter Controls Row | Mobile/Tablet: Filter Controls (collapsible) */}
      <div
        className={` ${filtersExpanded ? "flex" : "hidden"} flex-col gap-3 lg:flex lg:flex-row lg:flex-nowrap lg:items-end lg:gap-2`}
      >
        {/* Search Bar - Desktop Only (inline with filters) */}
        <div className="hidden w-80 flex-shrink-0 lg:block">
          <SearchInput
            ref={desktopSearchRef}
            id="entity-search-desktop"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search for UN entities..."
            ariaLabel="Search for UN entities by keyword"
          />
        </div>

        {/* Principal Organ Filter Popover */}
        <FilterDropdown
          open={isPrincipalOrganPopoverOpen}
          onOpenChange={setIsPrincipalOrganPopoverOpen}
          icon={<Landmark className="h-4 w-4" />}
          triggerText={getPrincipalOrganFilterText()}
          isFiltered={!allPrincipalOrgansActive}
          allActive={allPrincipalOrgansActive}
          options={getSortedPrincipalOrgans().map(([organKey, config]) => ({
            key: organKey,
            label: config.label,
          }))}
          selectedKeys={activePrincipalOrgans}
          onToggle={onTogglePrincipalOrgan}
          ariaLabel="Filter entities by principal organ"
        />

        {/* Filter Popover */}
        <FilterDropdown
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          icon={<Boxes className="h-4 w-4" />}
          triggerText={getFilterText()}
          isFiltered={!allGroupsActive}
          allActive={allGroupsActive}
          options={sortedGroups.map(([group, styles]) => ({
            key: group,
            label: styles.label,
            count: groupCounts[group] || 0,
            color: styles.bgColor,
          }))}
          selectedKeys={activeGroups}
          onToggle={onToggleGroup}
          ariaLabel="Filter entities by system group"
        />

        {/* Reset Button - Desktop only - only show when there's something to reset */}
        {isResetNeeded && (
          <ResetButton onClick={onReset} className="hidden lg:flex" />
        )}
      </div>

      {/* Grouping Mode Tabs Row with Entity Count */}
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 ${filtersExpanded ? "mt-1" : "-mt-3"} lg:mt-0`}
      >
        <ViewToggle value={groupingMode} onValueChange={onGroupingModeChange} />

        {/* Entity Count - aligned with tabs on larger screens, wraps below on mobile */}
        <div className="text-left text-base whitespace-nowrap text-gray-400 transition-opacity duration-500 sm:flex-1 sm:text-right">
          Showing {visibleEntitiesCount} entities
        </div>
      </div>
    </div>
  );
}
