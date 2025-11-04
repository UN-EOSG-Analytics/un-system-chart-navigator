'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getSortedSystemGroupings, systemGroupingStyles } from '@/lib/systemGroupings';
import { Entity } from '@/types/entity';
import { Check, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

interface FilterControlsProps {
    activeGroups: Set<string>;
    onToggleGroup: (groupKey: string) => void;
    entities: Entity[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onReset: () => void;
    visibleEntitiesCount: number;
}

export default function FilterControls({
    activeGroups,
    onToggleGroup,
    entities,
    searchQuery,
    onSearchChange,
    onReset,
    visibleEntitiesCount
}: FilterControlsProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Count entities for each group
    const groupCounts = entities.reduce((acc, entity) => {
        acc[entity.system_grouping] = (acc[entity.system_grouping] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Check if all groups are active (showing all) or only specific ones are filtered
    const allGroupsActive = activeGroups.size === Object.keys(systemGroupingStyles).length;

    // Sort groups by their order
    const sortedGroups = getSortedSystemGroupings();

    // Check if reset is needed
    const isResetNeeded = searchQuery.trim() !== '' || !allGroupsActive;

    // Get filter button text
    const getFilterText = () => {
        if (allGroupsActive) {
            return 'Filter System Groups...';
        }
        const count = activeGroups.size;
        return `${count} group${count !== 1 ? 's' : ''} selected`;
    };

    return (
        <div className="flex flex-col gap-2 mb-4 sm:mb-6">
            {/* Filter Controls Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-end">
                {/* Search Input */}
                <div className="relative w-full sm:w-80 md:w-96 lg:w-[26rem]">
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
                        className="block w-full h-12 sm:h-10 pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-lg placeholder-gray-500 focus:outline-none focus:border-gray-300 focus:ring-0 text-base text-gray-700 touch-manipulation hover:border-gray-300 transition-colors"
                        aria-label="Search for UN entities by keyword"
                    />
                </div>

                {/* Filter Popover */}
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={`
                                relative w-full sm:w-64 md:w-72 h-12 sm:h-10 
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
                            <Filter className={`h-4 w-4 ${!allGroupsActive ? 'text-un-blue' : 'text-gray-500'}`} />
                            <span className={!allGroupsActive ? 'text-un-blue' : 'text-gray-500'}>
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

                {/* Reset Button - only show when there's something to reset */}
                {isResetNeeded && (
                    <button
                        onClick={onReset}
                        className="
              flex items-center justify-center h-12 sm:h-10 w-12 sm:w-10 rounded-lg
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

                {/* Entity Count - stays on same line on large screens only */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-end">
                    <div className="text-gray-400 text-base transition-opacity duration-500 whitespace-nowrap">
                        Showing {visibleEntitiesCount} entities
                    </div>
                </div>
            </div>

            {/* Entity Count - wraps down on medium and smaller screens */}
            <div className="lg:hidden text-left text-gray-400 text-xs sm:text-sm transition-opacity duration-500 whitespace-nowrap">
                Showing {visibleEntitiesCount} entities
            </div>
        </div>
    );
}