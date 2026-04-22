"use client";

import ResetButton from "@/components/ResetButton";
import SearchInput from "@/components/SearchInput";
import { Expand, FileText, Shrink } from "lucide-react";
import { filterControls } from "@/lib/styles";
import { useEffect, useRef } from "react";

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchEnter?: () => void;
  onReset: () => void;
  allExpanded?: boolean;
  onToggleExpandAll: () => void;
}

export default function FilterControls({
  searchQuery,
  onSearchChange,
  onSearchEnter,
  onReset,
  allExpanded,
  onToggleExpandAll,
}: FilterControlsProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      searchRef.current?.focus();
    }
  }, []);

  const isResetNeeded = searchQuery.trim() !== "";

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
          <span className="hidden lg:inline">
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
          <span className="hidden whitespace-nowrap lg:inline">
            See PDF version →
          </span>
        </a>
      </div>
    </div>
  );
}
