"use client";

import FilterDropdown from "@/components/FilterDropdown";
import ResetButton from "@/components/ResetButton";
import SearchInput from "@/components/SearchInput";
import { principalOrganConfigs } from "@/lib/constants";
import { getSortedPrincipalOrgans } from "@/lib/utils";
import { Entity } from "@/types/entity";
import { Expand, FileText, Landmark, Shrink } from "lucide-react";
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
    <div className="fixed top-14 right-0 left-0 z-30 bg-linear-to-b from-white from-55% to-transparent px-4 pt-3 pb-10 sm:px-6 md:px-10 lg:px-12 xl:px-16">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 lg:gap-2">
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
          className={`relative flex h-10 shrink-0 touch-manipulation items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${allExpanded === true ? "border-un-blue bg-white text-un-blue hover:bg-un-blue/5" : "border-slate-300 bg-white text-slate-400 hover:border-un-blue hover:text-un-blue"}`}
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
          className="ml-auto flex h-10 shrink-0 touch-manipulation items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-400 transition-colors hover:border-un-blue hover:text-un-blue"
          aria-label="View PDF version of the UN System Chart"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">See PDF version →</span>
        </a>
      </div>
    </div>
  );
}
