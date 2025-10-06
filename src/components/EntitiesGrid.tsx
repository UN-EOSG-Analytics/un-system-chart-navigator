'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Entity } from '@/types';
import FilterControls from './FilterControls';
import BudgetTreemap from './BudgetTreemap';
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllEntities, searchEntities } from '@/lib/entities';
import { createEntitySlug } from '@/lib/utils';
import { systemGroupingStyles, getSystemGroupingStyle } from '@/lib/systemGroupings';

const EntityCard = ({ entity, onEntityClick }: { entity: Entity; onEntityClick: (entitySlug: string) => void }) => {
    const styles = getSystemGroupingStyle(entity.system_grouping);
    const entitySlug = createEntitySlug(entity.entity);

    const handleClick = () => {
        onEntityClick(entitySlug);
    };

    return (
        <Tooltip delayDuration={50} disableHoverableContent>
            <TooltipTrigger asChild>
                <div
                    data-entity={entity.entity}
                    onClick={handleClick}
                    className={`${styles.bgColor} ${styles.textColor} h-[50px] sm:h-[55px] p-2 rounded-lg flex items-center justify-center text-center cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 touch-manipulation`}
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
    const [showBudget, setShowBudget] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [displayBudget, setDisplayBudget] = useState<boolean>(false);
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
    };

    const toggleBudget = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        
        // Start display transition first
        setDisplayBudget(prev => !prev);
        
        // Then trigger view change after brief delay
        setTimeout(() => {
            setShowBudget(prev => !prev);
        }, 400);
        
        // Reset animation lock
        setTimeout(() => {
            setIsAnimating(false);
        }, 800);
    };

    useImperativeHandle(ref, () => ({
        handleReset,
        toggleGroup
    }));

    // Filter and sort entities
    const visibleEntities = (searchQuery.trim() ? searchEntities(searchQuery) : entities)
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
                showBudget={showBudget}
                onToggleBudget={toggleBudget}
            />

            {/* Animated View Container */}
            <div className="relative w-full" data-view-container>
                <div 
                    className="transition-opacity duration-500 ease-in-out"
                    style={{ opacity: displayBudget === showBudget ? 1 : 0 }}
                >
                    {showBudget ? (
                        <BudgetTreemap 
                            entities={visibleEntities} 
                            onEntityClick={handleEntityClick}
                            activeGroups={activeGroups}
                        />
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 w-full">
                            {visibleEntities.map((entity: Entity) => (
                                <EntityCard key={entity.entity} entity={entity} onEntityClick={handleEntityClick} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* As of Date */}
            {!showBudget && (
                <div className="mt-4 text-left">
                    <p className="text-base text-gray-600">As of September 2025</p>
                </div>
            )}
        </div>
    );
});

EntitiesGrid.displayName = 'EntitiesGrid';

export default EntitiesGrid;
