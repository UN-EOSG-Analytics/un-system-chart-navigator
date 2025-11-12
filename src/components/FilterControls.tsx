'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FilterDropdown from '@/components/FilterDropdown';
import { getSortedPrincipalOrgans, principalOrganConfigs } from '@/lib/principalOrgans';
import { getSortedSystemGroupings, systemGroupingStyles } from '@/lib/systemGroupings';
import { Entity } from '@/types/entity';
import { Boxes, ChevronDown, ChevronUp, Filter, Landmark, RotateCcw, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FilterControlsProps {
    activeGroups: Set<string>;
    onToggleGroup: (groupKey: string) => void;
    groupingMode: 'system' | 'principal-organ';
    onGroupingModeChange: (mode: 'system' | 'principal-organ') => void;
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
    visibleEntitiesCount
}: FilterControlsProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isPrincipalOrganPopoverOpen, setIsPrincipalOrganPopoverOpen] = useState(false);
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
    const groupCounts = entities.reduce((acc, entity) => {
        acc[entity.system_grouping] = (acc[entity.system_grouping] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Check if all groups are active (showing all) or only specific ones are filtered
    const allGroupsActive = activeGroups.size === Object.keys(systemGroupingStyles).length;

    // Check if all principal organs are active
    const allPrincipalOrgansActive = activePrincipalOrgans.size === Object.keys(principalOrganConfigs).length;

    // Sort groups by their order
    const sortedGroups = getSortedSystemGroupings();

    // Check if reset is needed
    const isResetNeeded = searchQuery.trim() !== '' || !allGroupsActive || !allPrincipalOrgansActive;

    // Get filter button text
    const getFilterText = () => {
        if (allGroupsActive) {
            return 'Filter by System Group...';
        }
        const count = activeGroups.size;
        return `${count} Group${count !== 1 ? 's' : ''} selected`;
    };

    // Get principal organ filter button text
    const getPrincipalOrganFilterText = () => {
        if (allPrincipalOrgansActive) {
            return 'Filter by Principal Organ...';
        }
        const count = activePrincipalOrgans.size;
        return `${count} Organ${count !== 1 ? 's' : ''} selected`;
    };

    return (
        <div className="flex flex-col gap-3 mb-4 lg:mb-6">
            {/* Search Bar - Mobile/Tablet Only (separate) */}
            <div className="lg:hidden relative w-full mt-2">
                <label htmlFor="entity-search" className="sr-only">Search for entities</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
                </div>
                <input
                    ref={mobileSearchRef}
                    type="text"
                    id="entity-search"
                    placeholder="Search for entities..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full h-10 pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-lg placeholder-gray-500 focus:outline-none focus:border-gray-300 focus:ring-0 text-base text-gray-700 touch-manipulation hover:border-gray-300 transition-colors"
                    aria-label="Search for UN entities by keyword"
                />
            </div>

            {/* Mobile/Tablet: Toggle Filters Button + Reset Button Row */}
            <div className="lg:hidden flex items-center justify-between gap-2 -mt-1 mb-0.5">
                <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className={`
                        w-auto h-10
                        flex items-center gap-2 px-3 
                        text-sm
                        touch-manipulation transition-colors
                        ${(!allGroupsActive || !allPrincipalOrgansActive)
                            ? 'text-un-blue'
                            : 'text-gray-500'
                        }
                    `}
                    aria-label={filtersExpanded ? "Hide filters" : "Show filters"}
                    aria-expanded={filtersExpanded}
                >
                    <Filter className="h-4 w-4" />
                    <span>{filtersExpanded ? 'Hide' : 'Show'} Filters</span>
                    {filtersExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {/* Reset Button - Mobile/Tablet - only show when there's something to reset */}
                {isResetNeeded && (
                    <button
                        onClick={onReset}
                        className="
                            flex items-center justify-center gap-1.5 h-10 px-3
                            border border-gray-300 bg-gray-200 rounded-lg
                            transition-all duration-200 ease-out touch-manipulation
                            text-gray-700 hover:border-gray-400 hover:bg-gray-300
                            focus:outline-none focus:border-gray-400 focus:bg-gray-300
                            text-sm font-medium flex-shrink-0
                        "
                        aria-label="Clear filters and search"
                        title="Clear filters and search"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset</span>
                    </button>
                )}
            </div>

            {/* Desktop: Search + Filter Controls Row | Mobile/Tablet: Filter Controls (collapsible) */}
            <div className={`
                ${filtersExpanded ? 'flex' : 'hidden'} lg:flex
                flex-col lg:flex-row lg:flex-nowrap gap-3 lg:gap-2 lg:items-end
            `}>
                {/* Search Bar - Desktop Only (inline with filters) */}
                <div className="hidden lg:block relative w-80 flex-shrink-0">
                    <label htmlFor="entity-search-desktop" className="sr-only">Search for entities</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </div>
                    <input
                        ref={desktopSearchRef}
                        type="text"
                        id="entity-search-desktop"
                        placeholder="Search for entities..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full h-10 pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-lg placeholder-gray-500 focus:outline-none focus:border-gray-300 focus:ring-0 text-base text-gray-700 touch-manipulation hover:border-gray-300 transition-colors"
                        aria-label="Search for UN entities by keyword"
                    />
                </div>

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

                {/* Reset Button - Desktop only - only show when there's something to reset */}
                {isResetNeeded && (
                    <button
                        onClick={onReset}
                        className="
                            hidden lg:flex items-center justify-center h-10 w-10
                            border border-gray-300 bg-gray-200 rounded-lg
                            transition-all duration-200 ease-out touch-manipulation
                            text-gray-700 hover:border-gray-400 hover:bg-gray-300
                            focus:outline-none focus:border-gray-400 focus:bg-gray-300
                        "
                        aria-label="Clear filters and search"
                        title="Clear filters and search"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Grouping Mode Tabs Row with Entity Count */}
            <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${filtersExpanded ? 'mt-1' : '-mt-3'} lg:mt-0`}>
                <Tabs value={groupingMode} onValueChange={(value) => onGroupingModeChange(value as 'system' | 'principal-organ')}>
                    <TabsList className="grid w-full sm:w-80 grid-cols-2 bg-white border border-gray-200 h-10">
                        <TabsTrigger
                            value="system"
                            className="data-[state=active]:bg-un-blue/10 data-[state=active]:text-un-blue data-[state=active]:border-un-blue text-sm text-gray-500 border border-transparent rounded-md transition-colors"
                        >
                            By System Group
                        </TabsTrigger>
                        <TabsTrigger
                            value="principal-organ"
                            className="data-[state=active]:bg-un-blue/10 data-[state=active]:text-un-blue data-[state=active]:border-un-blue text-sm text-gray-500 border border-transparent rounded-md transition-colors"
                        >
                            By Principal Organ
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Entity Count - aligned with tabs on larger screens, wraps below on mobile */}
                <div className="text-left sm:text-right sm:flex-1 text-gray-400 text-base transition-opacity duration-500 whitespace-nowrap">
                    Showing {visibleEntitiesCount} entities
                </div>
            </div>
        </div>
    );
}