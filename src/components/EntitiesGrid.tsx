'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getAllEntities, searchEntities } from '@/lib/entities';
import { getSystemGroupingStyle, systemGroupingStyles } from '@/lib/systemGroupings';
import { createEntitySlug } from '@/lib/utils';
import { Entity } from '@/types/entity';
import { useRouter, useSearchParams } from 'next/navigation';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import FilterControls from './FilterControls';

const EntityCard = ({ entity, onEntityClick }: { entity: Entity; onEntityClick: (entitySlug: string) => void }) => {
    const styles = getSystemGroupingStyle(entity.system_grouping);

    // Create URL-friendly slug from entity name using utility function
    const entitySlug = createEntitySlug(entity.entity);

    // All cards take exactly 1 grid cell for uniform appearance

    const handleClick = () => {
        onEntityClick(entitySlug);
    };

    return (
        <Tooltip delayDuration={50} disableHoverableContent>
            <TooltipTrigger asChild>
                <div
                    onClick={handleClick}
                    className={`${styles.bgColor} ${styles.textColor} h-[50px] sm:h-[55px] p-2 rounded-lg flex items-center justify-center text-center transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 animate-in fade-in slide-in-from-bottom-4 touch-manipulation`}
                >
                    <span className="font-medium text-xs sm:text-sm leading-tight">{entity.entity}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                sideOffset={8}
                className="bg-white text-slate-800 border border-slate-200 shadow-lg max-w-xs sm:max-w-sm"
                hideWhenDetached
                avoidCollisions={true}
                collisionPadding={12}
            >
                <div className="text-center max-w-xs sm:max-w-sm p-1">
                    <p className="font-medium text-xs sm:text-sm leading-tight">{entity.entity_long}</p>
                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Click to view entity details</p>
                    <p className="text-xs text-slate-500 mt-1 sm:hidden">Tap to view details</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

const EntitiesGrid = forwardRef<{ handleReset: () => void; toggleGroup: (groupKey: string) => void }>((props, ref) => {
    const entities = getAllEntities();
    const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set(Object.keys(systemGroupingStyles)));
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for filter parameter on mount and when URL changes
    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam) {
            setActiveGroups(new Set([filterParam]));
            setSearchQuery('');
            // Clear the filter parameter from URL after applying it
            router.replace('/', { scroll: false });
        }
    }, [searchParams, router]);

    const toggleGroup = (groupKey: string) => {
        setActiveGroups(prev => {
            // If this group is the only active one, show all groups
            if (prev.size === 1 && prev.has(groupKey)) {
                return new Set(Object.keys(systemGroupingStyles));
            }
            // Otherwise, show only this group
            return new Set([groupKey]);
        });
    };

    const handleEntityClick = (entitySlug: string) => {
        // Update URL without navigation to prevent page jumping
        router.replace(`/?entity=${entitySlug}`, { scroll: false });
    };

    const handleReset = () => {
        setSearchQuery('');
        setActiveGroups(new Set(Object.keys(systemGroupingStyles)));
        setExpandedGroups(new Set());
    };

    const toggleExpansion = (groupKey: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    };

    useImperativeHandle(ref, () => ({
        handleReset,
        toggleGroup
    }));

    // Filter and sort entities
    const filteredEntities = (searchQuery.trim() ? searchEntities(searchQuery) : entities)
        .filter((entity: Entity) => activeGroups.has(entity.system_grouping))
        .sort((a: Entity, b: Entity) => {
            // First sort by group order defined in systemGroupingStyles
            if (a.system_grouping !== b.system_grouping) {
                const orderA = getSystemGroupingStyle(a.system_grouping).order;
                const orderB = getSystemGroupingStyle(b.system_grouping).order;
                return orderA - orderB;
            }
            // Within the same group, sort alphabetically but put "Other" at the end
            const aIsOther = a.entity === 'Other';
            const bIsOther = b.entity === 'Other';

            if (aIsOther && !bIsOther) return 1;  // a is "Other", put it after b
            if (!aIsOther && bIsOther) return -1; // b is "Other", put it after a

            // Both are "Other" or neither is "Other", sort alphabetically
            return a.entity.localeCompare(b.entity);
        });

    // Build the grid with primary entities, "Show more" buttons, and conditionally secondary entities
    const gridItems: Array<{ type: 'entity' | 'expand-button'; entity?: Entity; groupKey?: string; secondaryCount?: number }> = [];

    // Group entities by system_grouping first
    const groupedEntities = filteredEntities.reduce((acc, entity) => {
        const group = entity.system_grouping;
        if (!acc[group]) {
            acc[group] = { primary: [], secondary: [] };
        }
        if (entity.is_primary_entity) {
            acc[group].primary.push(entity);
        } else {
            acc[group].secondary.push(entity);
        }
        return acc;
    }, {} as Record<string, { primary: Entity[]; secondary: Entity[] }>);

    // Get sorted group keys based on systemGroupingStyles order
    const sortedGroupKeys = Object.keys(groupedEntities).sort((a, b) => {
        const orderA = getSystemGroupingStyle(a).order;
        const orderB = getSystemGroupingStyle(b).order;
        return orderA - orderB;
    });

    // Build the flat grid items array
    sortedGroupKeys.forEach(groupKey => {
        const group = groupedEntities[groupKey];

        // Add primary entities
        group.primary.forEach(entity => {
            gridItems.push({ type: 'entity', entity });
        });

        // Add expand/collapse button if there are secondary entities
        if (group.secondary.length > 0) {
            gridItems.push({
                type: 'expand-button',
                groupKey,
                secondaryCount: group.secondary.length
            });

            // If expanded, add secondary entities
            if (expandedGroups.has(groupKey)) {
                group.secondary.forEach(entity => {
                    gridItems.push({ type: 'entity', entity });
                });
            }
        } else {
            // If no secondary entities but expanded state exists, add them anyway
            if (expandedGroups.has(groupKey)) {
                group.secondary.forEach(entity => {
                    gridItems.push({ type: 'entity', entity });
                });
            }
        }
    });

    const visibleEntitiesCount = gridItems.filter(item => item.type === 'entity').length;

    return (
        <div className="w-full">
            {/* Search and Filter Controls */}
            <FilterControls
                activeGroups={activeGroups}
                onToggleGroup={toggleGroup}
                entities={entities}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onReset={handleReset}
                visibleEntitiesCount={visibleEntitiesCount}
            />

            {/* Unified Entities Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 w-full transition-all duration-300 ease-out">
                {gridItems.map((item) => {
                    if (item.type === 'entity' && item.entity) {
                        return <EntityCard key={item.entity.entity} entity={item.entity} onEntityClick={handleEntityClick} />;
                    } else if (item.type === 'expand-button' && item.groupKey) {
                        const isExpanded = expandedGroups.has(item.groupKey);
                        const styles = getSystemGroupingStyle(item.groupKey);

                        return (
                            <div
                                key={`expand-${item.groupKey}`}
                                onClick={() => toggleExpansion(item.groupKey!)}
                                className={`${styles.bgColor} ${styles.textColor} h-[50px] sm:h-[55px] p-2 rounded-lg flex items-center justify-center text-center transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 border-2 border-dashed border-opacity-50 border-current`}
                            >
                                <span className="font-medium text-xs sm:text-sm leading-tight">
                                    {isExpanded
                                        ? 'Show less'
                                        : `+ ${item.secondaryCount} more`
                                    }
                                </span>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {/* As of Date */}
            <div className="mt-4 text-left">
                <p className="text-base text-gray-600">As of October 2025</p>
            </div>
        </div>
    );
});

EntitiesGrid.displayName = 'EntitiesGrid';

export default EntitiesGrid;
