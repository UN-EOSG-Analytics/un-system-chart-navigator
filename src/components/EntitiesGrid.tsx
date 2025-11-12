'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getAllEntities, searchEntities } from '@/lib/entities';
import { getSystemGroupingStyle, systemGroupingStyles } from '@/lib/systemGroupings';
import { normalizePrincipalOrgan, principalOrganConfigs } from '@/lib/principalOrgans';
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
                <button
                    onClick={handleClick}
                    className={`${styles.bgColor} ${styles.textColor} h-[50px] sm:h-[55px] pt-3 pl-3 pr-2 pb-2 rounded-lg flex items-start justify-start text-left transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 animate-in fade-in slide-in-from-bottom-4 touch-manipulation w-full`}
                    aria-label={`View details for ${entity.entity_long}`}
                >
                    <span className="font-medium text-xs sm:text-sm leading-tight">{entity.entity}</span>
                </button>
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
    const [groupingMode, setGroupingMode] = useState<'system' | 'principal-organ'>('system');
    const [activePrincipalOrgans, setActivePrincipalOrgans] = useState<Set<string>>(new Set(Object.keys(principalOrganConfigs)));
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
            const allGroups = Object.keys(systemGroupingStyles);
            const allActive = prev.size === allGroups.length;
            
            // If all groups are active (no filter), start a new selection with just this group
            if (allActive) {
                return new Set([groupKey]);
            }
            
            // Otherwise, toggle the group in the current selection
            const newGroups = new Set(prev);
            
            if (newGroups.has(groupKey)) {
                // Remove the group
                newGroups.delete(groupKey);
                // If no groups left, show all
                if (newGroups.size === 0) {
                    return new Set(allGroups);
                }
            } else {
                // Add the group
                newGroups.add(groupKey);
            }
            
            return newGroups;
        });
    };

    const togglePrincipalOrgan = (organKey: string) => {
        setActivePrincipalOrgans(prev => {
            const allOrgans = Object.keys(principalOrganConfigs);
            const allActive = prev.size === allOrgans.length;
            
            // If all organs are active (no filter), start a new selection with just this organ
            if (allActive) {
                return new Set([organKey]);
            }
            
            // Otherwise, toggle the organ in the current selection
            const newOrgans = new Set(prev);
            
            if (newOrgans.has(organKey)) {
                // Remove the organ
                newOrgans.delete(organKey);
                // If no organs left, show all
                if (newOrgans.size === 0) {
                    return new Set(allOrgans);
                }
            } else {
                // Add the organ
                newOrgans.add(organKey);
            }
            
            return newOrgans;
        });
    };

    const handleEntityClick = (entitySlug: string) => {
        // Update URL without navigation to prevent page jumping
        router.replace(`/?entity=${entitySlug}`, { scroll: false });
    };

    const handleReset = () => {
        // Full reset including mode - used when clicking home header
        setSearchQuery('');
        setActiveGroups(new Set(Object.keys(systemGroupingStyles)));
        setActivePrincipalOrgans(new Set(Object.keys(principalOrganConfigs)));
        setGroupingMode('system');
    };
    
    const handleFilterReset = () => {
        // Partial reset preserving mode - used by reset button
        setSearchQuery('');
        setActiveGroups(new Set(Object.keys(systemGroupingStyles)));
        setActivePrincipalOrgans(new Set(Object.keys(principalOrganConfigs)));
        // Don't reset grouping mode - preserve user's view preference
    };

    useImperativeHandle(ref, () => ({
        handleReset,
        toggleGroup
    }));

    // Filter and sort entities
    const visibleEntities = (searchQuery.trim() ? searchEntities(searchQuery) : entities)
        .filter((entity: Entity) => {
            // Filter by system grouping
            if (!activeGroups.has(entity.system_grouping)) return false;
            
            // Filter by principal organ - check if entity's organ is in active set
            const normalizedOrgan = normalizePrincipalOrgan(entity.un_principal_organ);
            const organToCheck = Array.isArray(normalizedOrgan) ? (normalizedOrgan[0] || 'Other') : (normalizedOrgan || 'Other');
            if (!activePrincipalOrgans.has(organToCheck)) return false;
            
            return true;
        })
        .sort((a: Entity, b: Entity) => {
            if (groupingMode === 'principal-organ') {
                // Sort by principal organ order, then system grouping, then alphabetically
                const aNormalized = normalizePrincipalOrgan(a.un_principal_organ);
                const bNormalized = normalizePrincipalOrgan(b.un_principal_organ);
                
                // Get primary organ for each entity (first one if array)
                const aOrgan = Array.isArray(aNormalized) ? aNormalized[0] : aNormalized;
                const bOrgan = Array.isArray(bNormalized) ? bNormalized[0] : bNormalized;
                
                if (aOrgan !== bOrgan) {
                    const aConfig = principalOrganConfigs[aOrgan || ''];
                    const bConfig = principalOrganConfigs[bOrgan || ''];
                    const orderA = aConfig?.order ?? 999;
                    const orderB = bConfig?.order ?? 999;
                    return orderA - orderB;
                }
                
                // Within the same organ, sort by system grouping first
                if (a.system_grouping !== b.system_grouping) {
                    const orderA = getSystemGroupingStyle(a.system_grouping).order;
                    const orderB = getSystemGroupingStyle(b.system_grouping).order;
                    return orderA - orderB;
                }
                
                // Within the same system grouping, sort alphabetically but put "Other" at the end
                const aIsOther = a.entity === 'Other';
                const bIsOther = b.entity === 'Other';
                if (aIsOther && !bIsOther) return 1;
                if (!aIsOther && bIsOther) return -1;
                return a.entity.localeCompare(b.entity);
            } else {
                // Sort by system grouping order, then alphabetically
                if (a.system_grouping !== b.system_grouping) {
                    const orderA = getSystemGroupingStyle(a.system_grouping).order;
                    const orderB = getSystemGroupingStyle(b.system_grouping).order;
                    return orderA - orderB;
                }
                
                // Within the same group, sort alphabetically but put "Other" at the end
                const aIsOther = a.entity === 'Other';
                const bIsOther = b.entity === 'Other';
                if (aIsOther && !bIsOther) return 1;
                if (!aIsOther && bIsOther) return -1;
                return a.entity.localeCompare(b.entity);
            }
        });

    // Group entities based on current grouping mode
    const groupedEntities = visibleEntities.reduce((acc: Record<string, Entity[]>, entity: Entity) => {
        let groupKey: string;
        
        if (groupingMode === 'principal-organ') {
            const normalized = normalizePrincipalOrgan(entity.un_principal_organ);
            // Use first organ if array, or the organ itself
            groupKey = Array.isArray(normalized) ? (normalized[0] || 'Other') : (normalized || 'Other');
        } else {
            groupKey = entity.system_grouping;
        }
        
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(entity);
        return acc;
    }, {});

    // Get sorted group keys based on the current grouping mode
    const sortedGroupKeys = Object.keys(groupedEntities).sort((a, b) => {
        if (groupingMode === 'principal-organ') {
            const aConfig = principalOrganConfigs[a];
            const bConfig = principalOrganConfigs[b];
            const orderA = aConfig?.order ?? 999;
            const orderB = bConfig?.order ?? 999;
            return orderA - orderB;
        } else {
            const orderA = getSystemGroupingStyle(a).order;
            const orderB = getSystemGroupingStyle(b).order;
            return orderA - orderB;
        }
    });

    return (
        <div className="w-full">
            {/* Search and Filter Controls */}
            <FilterControls
                activeGroups={activeGroups}
                onToggleGroup={toggleGroup}
                groupingMode={groupingMode}
                onGroupingModeChange={setGroupingMode}
                activePrincipalOrgans={activePrincipalOrgans}
                onTogglePrincipalOrgan={togglePrincipalOrgan}
                entities={entities}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onReset={handleFilterReset}
                visibleEntitiesCount={visibleEntities.length}
            />

            {/* Entities Grid with Group Headings */}
            {visibleEntities.length === 0 ? (
                <div className="text-left py-20">
                    <p className="text-gray-500 text-lg">No entities match the current filters.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedGroupKeys.map((groupKey) => {
                        // Get the appropriate style/label based on grouping mode
                        const groupLabel = groupingMode === 'principal-organ' 
                            ? (principalOrganConfigs[groupKey]?.label || groupKey)
                            : getSystemGroupingStyle(groupKey).label;
                        
                        return (
                            <div key={groupKey} className="animate-in fade-in slide-in-from-bottom-4">
                                {/* Group Heading */}
                                <div className="mb-4">
                                    <div className="h-px bg-gradient-to-r from-gray-400 via-gray-200 to-transparent mb-1"></div>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                                        {groupLabel}
                                    </h2>
                                </div>
                                
                                {/* Group Grid */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 w-full">
                                    {groupedEntities[groupKey].map((entity: Entity) => (
                                        <EntityCard key={entity.entity} entity={entity} onEntityClick={handleEntityClick} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

EntitiesGrid.displayName = 'EntitiesGrid';

export default EntitiesGrid;
