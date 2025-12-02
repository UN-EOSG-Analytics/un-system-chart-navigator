"use client";

import FilterDropdown from "@/components/FilterDropdown";
import ResetButton from "@/components/ResetButton";
import SearchInput from "@/components/SearchInput";
import {
  getSortedPrincipalOrgans,
  principalOrganConfigs,
} from "@/lib/constants";
import { Entity } from "@/types/entity";
import { Landmark } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FilterControlsProps {
  activePrincipalOrgans: Set<string>;
  onTogglePrincipalOrgan: (organ: string) => void;
  entities: Entity[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  visibleEntitiesCount: number;
}

export default function FilterControls({
  activePrincipalOrgans,
  onTogglePrincipalOrgan,
  searchQuery,
  onSearchChange,
  onReset,
  visibleEntitiesCount,
}: FilterControlsProps) {
  const [isPrincipalOrganPopoverOpen, setIsPrincipalOrganPopoverOpen] =
    useState(false);

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

  // Check if all principal organs are active
  const allPrincipalOrgansActive =
    activePrincipalOrgans.size === Object.keys(principalOrganConfigs).length;

  // Check if reset is needed
  const isResetNeeded = searchQuery.trim() !== "" || !allPrincipalOrgansActive;

  // Get principal organ filter button text
  const getPrincipalOrganFilterText = () => {
    if (allPrincipalOrgansActive) {
      return "Filter by Principal Organ";
    }
    const count = activePrincipalOrgans.size;
    return `${count} Organ${count !== 1 ? "s" : ""} selected`;
  };

  return (
    <div className="mb-4 flex flex-col gap-3 lg:mb-10">
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

      {/* Search + Filter Controls Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-2">
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

        {/* Reset Button - only show when there's something to reset */}
        {isResetNeeded && <ResetButton onClick={onReset} showLabel={true} />}

        {/* Entity Count - Desktop: aligned right on same row */}
        <div className="hidden text-base whitespace-nowrap text-gray-400 transition-opacity duration-500 lg:ml-auto lg:block lg:pb-2">
          Showing {visibleEntitiesCount} entities
        </div>
      </div>

      {/* Entity Count - Mobile: Always visible below search */}
      <div className="text-left text-base whitespace-nowrap text-gray-400 transition-opacity duration-500 sm:text-right lg:hidden">
        Showing {visibleEntitiesCount} entities
      </div>
    </div>
  );
}
