"use client";

import FilterDropdown from "@/components/FilterDropdown";
import ResetButton from "@/components/ResetButton";
import SearchInput from "@/components/SearchInput";
import { principalOrganConfigs } from "@/lib/constants";
import { getSortedPrincipalOrgans } from "@/lib/utils";
import { Entity } from "@/types/entity";
import { Landmark } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Props for the FilterControls component.
 */
interface FilterControlsProps {
  /** Set of currently active principal organ filters */
  activePrincipalOrgans: Set<string>;
  /** Callback to toggle a principal organ filter on/off */
  onTogglePrincipalOrgan: (organ: string) => void;
  /** Full array of entities (used for filter options) */
  entities: Entity[];
  /** Current search query text */
  searchQuery: string;
  /** Callback fired when search text changes */
  onSearchChange: (query: string) => void;
  /** Callback to reset all filters and search to default state */
  onReset: () => void;
  /** Number of entities currently visible after filtering */
  visibleEntitiesCount: number;
}

/**
 * Provides search and filter controls for the UN entities grid.
 *
 * Features:
 * - Text search input with auto-focus
 * - Principal organ filter dropdown with checkbox options
 * - Reset button to clear all filters
 * - Responsive layout (inline on desktop, stacked on mobile)
 * - Visual indicators for active filters
 */
export default function FilterControls({
  activePrincipalOrgans,
  onTogglePrincipalOrgan,
  searchQuery,
  onSearchChange,
  onReset,
}: FilterControlsProps) {
  const [isPrincipalOrganPopoverOpen, setIsPrincipalOrganPopoverOpen] =
    useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Check if all principal organs are active
  const allPrincipalOrgansActive =
    activePrincipalOrgans.size === Object.keys(principalOrganConfigs).length;

  // Check if reset is needed
  const isResetNeeded = searchQuery.trim() !== "" || !allPrincipalOrgansActive;

  // Get principal organ filter button text
  const getPrincipalOrganFilterText = () => {
    if (allPrincipalOrgansActive) {
      return "Filter by Principal Organ or Group";
    }
    const count = activePrincipalOrgans.size;
    return `${count} Organ${count !== 1 ? "s" : ""} selected`;
  };

  return (
    <div className="fixed top-14 right-0 left-0 z-30 bg-linear-to-b from-white from-55% to-transparent px-4 pt-3 pb-10 sm:px-6 md:px-10 lg:px-12 xl:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
        <div className="w-full lg:max-w-sm lg:flex-1">
          <SearchInput
            ref={searchRef}
            id="entity-search"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search for UN entities..."
            ariaLabel="Search for UN entities by keyword"
          />
        </div>

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

        {isResetNeeded && <ResetButton onClick={onReset} showLabel={true} />}
      </div>
    </div>
  );
}
