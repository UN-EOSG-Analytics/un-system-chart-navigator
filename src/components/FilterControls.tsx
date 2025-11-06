'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSortedPrincipalOrgans, principalOrganConfigs } from '@/lib/principalOrgans';
import { getSortedSystemGroupings, systemGroupingStyles } from '@/lib/systemGroupings';
import { Entity } from '@/types/entity';
import { Check, ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

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
            return 'Filter System Groups...';
        }
        const count = activeGroups.size;
        return `${count} group${count !== 1 ? 's' : ''} selected`;
    };

    // Get principal organ filter button text
    const getPrincipalOrganFilterText = () => {
        if (allPrincipalOrgansActive) {
            return 'Filter Principal Organs...';
        }
        const count = activePrincipalOrgans.size;
        return `${count} organ${count !== 1 ? 's' : ''} selected`;
    };

    return (
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            {/* Search Bar - Mobile Only (separate) */}
            <div className="sm:hidden relative w-full mt-2">
                <label htmlFor="entity-search" className="sr-only">Search for entities</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    id="entity-search"
                    placeholder="Search for entities..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full h-12 pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-lg placeholder-gray-500 focus:outline-none focus:border-gray-300 focus:ring-0 text-base text-gray-700 touch-manipulation hover:border-gray-300 transition-colors"
                    aria-label="Search for UN entities by keyword"
                />
            </div>

            {/* Mobile: Toggle Filters Button + Reset Button Row */}
            <div className="sm:hidden flex items-center justify-between gap-2 -mt-1 mb-1">
                <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className={`
                        w-auto h-9
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

                {/* Reset Button - Mobile - only show when there's something to reset */}
                {isResetNeeded && (
                    <button
                        onClick={onReset}
                        className="
                            flex items-center justify-center gap-1.5 h-9 px-3 rounded-md
                            transition-all duration-200 ease-out touch-manipulation
                            text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-100 cursor-pointer
                            focus:outline-none focus:bg-gray-400 focus:text-gray-100
                            text-sm font-medium flex-shrink-0
                        "
                        aria-label="Clear filters and search"
                        title="Clear filters and search"
                    >
                        <X className="h-3.5 w-3.5" />
                        <span>Reset</span>
                    </button>
                )}
            </div>

            {/* Desktop: Search + Filter Controls Row | Mobile: Filter Controls (collapsible) */}
            <div className={`
                ${filtersExpanded ? 'flex' : 'hidden'} sm:flex
                flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-2 sm:items-end
            `}>
                {/* Search Bar - Desktop Only (inline with filters) */}
                <div className="hidden sm:block relative w-80 flex-shrink-0">
                    <label htmlFor="entity-search-desktop" className="sr-only">Search for entities</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </div>
                    <input
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
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={`
                                relative w-full sm:w-72 sm:flex-shrink-0 h-12 sm:h-10 
                                flex items-center gap-3 px-3 
                                border rounded-lg 
                                text-base text-gray-700
                                touch-manipulation transition-colors
                                ${!allGroupsActive
                                    ? 'bg-un-blue/10 border-un-blue hover:border-un-blue'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }
                            `}
                            aria-label="Filter entities by system group"
                        >
                            <Filter className={`h-4 w-4 flex-shrink-0 ${!allGroupsActive ? 'text-un-blue' : 'text-gray-500'}`} />
                            <span className={`truncate flex-1 text-left ${!allGroupsActive ? 'text-un-blue' : 'text-gray-500'}`}>
                                {getFilterText()}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[26rem] p-1 bg-white border-0 shadow-lg"
                        align="start"
                        sideOffset={4}
                    >
                        <div>
                            {sortedGroups.map(([group, styles]) => {
                                const count = groupCounts[group] || 0;
                                const isSelected = activeGroups.has(group);
                                // Only show checkmark if we're in filtered mode (not all groups active)
                                const showCheckmark = !allGroupsActive && isSelected;

                                return (
                                    <button
                                        key={group}
                                        onClick={() => onToggleGroup(group)}
                                        className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-un-blue/10 cursor-pointer transition-colors w-full text-left"
                                    >
                                        <div className={`${styles.bgColor} w-4 h-4 rounded flex-shrink-0`}></div>
                                        <span className="text-sm flex-1 text-gray-600">
                                            {styles.label} <span className="text-gray-400">({count})</span>
                                        </span>
                                        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                            {showCheckmark && (
                                                <Check className="h-4 w-4 text-un-blue" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Principal Organ Filter Popover */}
                <Popover open={isPrincipalOrganPopoverOpen} onOpenChange={setIsPrincipalOrganPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={`
                                relative w-full sm:w-72 sm:flex-shrink-0 h-12 sm:h-10 
                                flex items-center gap-3 px-3 
                                border rounded-lg 
                                text-base text-gray-700
                                touch-manipulation transition-colors
                                ${!allPrincipalOrgansActive
                                    ? 'bg-un-blue/10 border-un-blue hover:border-un-blue'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }
                            `}
                            aria-label="Filter entities by principal organ"
                        >
                            <Filter className={`h-4 w-4 flex-shrink-0 ${!allPrincipalOrgansActive ? 'text-un-blue' : 'text-gray-500'}`} />
                            <span className={`truncate flex-1 text-left ${!allPrincipalOrgansActive ? 'text-un-blue' : 'text-gray-500'}`}>
                                {getPrincipalOrganFilterText()}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[26rem] p-1 bg-white border-0 shadow-lg"
                        align="start"
                        sideOffset={4}
                    >
                        <div>
                            {getSortedPrincipalOrgans().map(([organKey, config]) => {
                                const isSelected = activePrincipalOrgans.has(organKey);
                                // Only show checkmark if we're in filtered mode (not all organs active)
                                const showCheckmark = !allPrincipalOrgansActive && isSelected;

                                return (
                                    <button
                                        key={organKey}
                                        onClick={() => onTogglePrincipalOrgan(organKey)}
                                        className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-un-blue/10 cursor-pointer transition-colors w-full text-left"
                                    >
                                        <span className="text-sm flex-1 text-gray-600">
                                            {config.label}
                                        </span>
                                        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                            {showCheckmark && (
                                                <Check className="h-4 w-4 text-un-blue" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Reset Button - Desktop only - only show when there's something to reset */}
                {isResetNeeded && (
                    <button
                        onClick={onReset}
                        className="
              hidden sm:flex items-center justify-center h-10 w-10 rounded-lg
              transition-all duration-200 ease-out touch-manipulation
              text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-100 cursor-pointer
              focus:outline-none focus:bg-gray-400 focus:text-gray-100
            "
                        aria-label="Clear filters and search"
                        title="Clear filters and search"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Grouping Mode Tabs Row with Entity Count */}
            <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${filtersExpanded ? '' : '-mt-3'} sm:mt-0`}>
                <Tabs value={groupingMode} onValueChange={(value) => onGroupingModeChange(value as 'system' | 'principal-organ')}>
                    <TabsList className="grid w-full sm:w-80 grid-cols-2 bg-white border border-gray-200 h-12 sm:h-10">
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
                <div className="text-left sm:text-right sm:flex-1 text-gray-400 text-sm sm:text-base transition-opacity duration-500 whitespace-nowrap">
                    Showing {visibleEntitiesCount} entities
                </div>
            </div>
        </div>
    );
}