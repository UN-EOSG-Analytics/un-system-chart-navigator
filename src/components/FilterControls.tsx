"use client";

import FilterDropdown from "@/components/FilterDropdown";
import ResetButton from "@/components/ResetButton";
import SearchInput from "@/components/SearchInput";
import { principalOrganConfigs } from "@/lib/constants";
import { getSortedPrincipalOrgans } from "@/lib/utils";
import { Entity } from "@/types/entity";
import { Expand, FileText, Landmark, Shrink } from "lucide-react";
import { filterControls } from "@/lib/styles";
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
  /** Callback fired when Enter is pressed in the search input */
  onSearchEnter?: () => void;
  /** Callback to reset all filters and search to default state */
  onReset: () => void;
  /** Number of entities currently visible after filtering */
  visibleEntitiesCount: number;
  /** Whether all sections are currently expanded */
  allExpanded?: boolean;
  /** Callback to toggle expand/collapse all sections */
  onToggleExpandAll: () => void;
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
  onSearchEnter,
  onReset,
  allExpanded,
  onToggleExpandAll,
}: FilterControlsProps) {
  const [isPrincipalOrganPopoverOpen, setIsPrincipalOrganPopoverOpen] =
    useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input on mount — desktop only (prevents keyboard popup on mobile)
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      searchRef.current?.focus();
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
      return "Filter by Principal Organ or Group";
    }
    const count = activePrincipalOrgans.size;
    return `${count} Organ${count !== 1 ? "s" : ""} selected`;
  };

  return (
    <div className={filterControls.bar}>
      <div className={filterControls.inner}>
        {/* Search — primary, takes all available space */}
        <div className="min-w-0 flex-1 lg:max-w-sm">
          <SearchInput
            ref={searchRef}
            id="entity-search"
            value={searchQuery}
            onChange={onSearchChange}
            onEnter={onSearchEnter}
            placeholder="Search for UN entities..."
            ariaLabel="Search for UN entities by keyword"
          />
        </div>

        {/* Filter — secondary, icon-only on mobile */}
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

        {/* Expand all — secondary, icon-only on mobile */}
        <button
          onClick={onToggleExpandAll}
          className={`${filterControls.iconButton} ${allExpanded === true ? filterControls.iconButtonActive : filterControls.iconButtonInactive}`}
          aria-label={
            allExpanded === true
              ? "Collapse all sections"
              : "Expand all sections"
          }
        >
          {allExpanded === true ? (
            <Shrink className="h-4 w-4 shrink-0" />
          ) : (
            <Expand className="h-4 w-4 shrink-0" />
          )}
          <span className="hidden sm:inline">
            {allExpanded === true ? "Collapse all" : "Expand all"}
          </span>
        </button>

        {/* Reset — only when needed */}
        <div className={isResetNeeded ? "contents" : "invisible"}>
          <ResetButton onClick={onReset} showLabel={false} />
        </div>

        {/* PDF Version link — right-aligned */}
        <a
          href="https://www.un.org/en/delegate/page/un-system-chart"
          target="_blank"
          rel="noopener noreferrer"
          className={`ml-auto ${filterControls.iconButton} ${filterControls.iconButtonInactive}`}
          aria-label="View PDF version of the UN System Chart"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="hidden whitespace-nowrap sm:inline">
            See PDF version →
          </span>
        </a>
      </div>
    </div>
  );
}
