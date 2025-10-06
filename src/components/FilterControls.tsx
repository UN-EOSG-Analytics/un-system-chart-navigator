'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { Entity } from '@/types';
import { systemGroupingStyles, getSortedSystemGroupings } from '@/lib/systemGroupings';

interface FilterControlsProps {
    activeGroups: Set<string>;
    onToggleGroup: (groupKey: string) => void;
    entities: Entity[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onReset: () => void;
    showBudget: boolean;
    onToggleBudget: () => void;
}

export default function FilterControls({
    activeGroups,
    onToggleGroup,
    entities,
    searchQuery,
    onSearchChange,
    onReset,
    showBudget,
    onToggleBudget
}: FilterControlsProps) {
    // Count entities for each group
    const groupCounts = entities.reduce((acc, entity) => {
        acc[entity.system_grouping] = (acc[entity.system_grouping] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Check if all groups are active (showing all) or only specific ones are filtered
    const allGroupsActive = activeGroups.size === Object.keys(systemGroupingStyles).length;

    // Sort groups by their order
    const sortedGroups = getSortedSystemGroupings();

    // Determine current selection value
    const getSelectedValue = () => {
        if (allGroupsActive) {
            return 'all';
        }
        // If only one group is active, return its key
        if (activeGroups.size === 1) {
            return Array.from(activeGroups)[0];
        }
        // Multiple groups but not all - this shouldn't happen with current logic but fallback to 'all'
        return 'all';
    };

    const handleValueChange = (value: string) => {
        if (value === 'all') {
            // Show all groups by clicking any group if not all are currently active
            // The toggle logic will handle showing all groups
            if (!allGroupsActive && activeGroups.size > 0) {
                const firstActiveGroup = Array.from(activeGroups)[0];
                onToggleGroup(firstActiveGroup);
            }
        } else {
            // Show only the selected group
            onToggleGroup(value);
        }
    };

    // Get display text for the current selection
    const getDisplayText = () => {
        if (allGroupsActive) {
            const totalEntities = entities.length;
            return (
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-un-blue flex-shrink-0 ml-3"></div>
                    <span className="font-medium text-base">All Groups ({totalEntities})</span>
                </div>
            );
        }

        if (activeGroups.size === 1) {
            const activeGroup = Array.from(activeGroups)[0];
            const styles = systemGroupingStyles[activeGroup];
            const count = groupCounts[activeGroup] || 0;
            return (
                <div className="flex items-center gap-3">
                    <div className={`${styles.bgColor} w-5 h-5 rounded flex-shrink-0 ml-3`}></div>
                    <span className="font-medium text-base">{styles.label} ({count})</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-un-blue flex-shrink-0 ml-3"></div>
                <span className="font-medium">All Groups ({entities.length})</span>
            </div>
        );
    };

    // Check if reset is needed
    const isResetNeeded = searchQuery.trim() !== '' || !allGroupsActive;

    return (
        <div className="flex flex-col gap-2 mb-4 sm:mb-6">
            {/* Filter Controls Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-end">
                {/* Filter Dropdown */}
                <div className="relative w-full sm:w-[320px]">
                    <Select value={getSelectedValue()} onValueChange={handleValueChange}>
                        <SelectTrigger className="w-full h-12 sm:h-10 bg-transparent border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-400 hover:border-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 px-0 py-2 transition-all duration-500 ease-out touch-manipulation" id="category-filter">
                            <SelectValue asChild>
                                <span className="flex items-center transition-all duration-500 ease-out">{getDisplayText()}</span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                            className="w-full sm:w-[320px] bg-white border-gray-300 z-50 animate-in fade-in slide-in-from-top-2 duration-500"
                            position="popper"
                            side="bottom"
                            align="start"
                            sideOffset={4}
                        >
                            <SelectItem value="all">
                                <div className="flex items-center gap-3 py-1">
                                    <div className="w-5 h-5 rounded bg-un-blue flex-shrink-0"></div>
                                    <span className="font-medium text-base">All Groups ({entities.length})</span>
                                </div>
                            </SelectItem>

                            {sortedGroups.map(([group, styles]) => {
                                const count = groupCounts[group] || 0;
                                return (
                                    <SelectItem key={group} value={group}>
                                        <div className="flex items-center gap-3 py-1">
                                            <div className={`${styles.bgColor} w-5 h-5 rounded flex-shrink-0`}></div>
                                            <span className="font-medium">{styles.label} ({count})</span>
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for entities..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full h-12 sm:h-10 pl-10 pr-3 py-2 border-0 border-b border-gray-300 bg-transparent placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 text-base rounded-none touch-manipulation"
                    />
                </div>

                {/* Reset Button - only show when there's something to reset */}
                {isResetNeeded && (
                    <button
                        onClick={onReset}
                        className="
              flex items-center justify-center h-8 w-8 rounded-full
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

                {/* Budget Toggle */}
                <div className="flex items-center gap-2 h-10">
                    <label className="text-sm text-gray-600 cursor-pointer" onClick={onToggleBudget}>
                        Expenses
                    </label>
                    <Switch checked={showBudget} onCheckedChange={onToggleBudget} />
                </div>
            </div>
        </div>
    );
}