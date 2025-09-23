'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Entity } from '@/types/entity';
import FilterControls from './FilterControls';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllEntities, searchEntities } from '@/lib/entities';
import { createEntitySlug } from '@/lib/utils';

// Color mapping for different groups with box colors, text colors, display labels, and order
const groupStyles: Record<string, { bgColor: string; textColor: string; order: number; label: string }> = {
    'UN Secretariat': {
        bgColor: 'bg-un-gray',
        textColor: 'text-black',
        order: 1,
        label: 'UN Secretariat'
    },
    'Peacekeeping operations and political missions': {
        label: 'Peacekeeping Operations, Political Missions, etc.',
        bgColor: 'bg-un-red',
        textColor: 'text-white',
        order: 2
    },
    'Regional Commissions': {
        bgColor: 'bg-un-system-aubergine',
        textColor: 'text-white',
        order: 3,
        label: 'Regional Commissions'
    },
    'Funds and Programmes': {
        bgColor: 'bg-camouflage-green',
        textColor: 'text-white',
        order: 4,
        label: 'Funds & Programmes'
    },
    'Research and Training': {
        bgColor: 'bg-camouflage-green',
        textColor: 'text-white',
        order: 5,
        label: 'Research & Training'
    },
    'Subsidiary Organs': {
        bgColor: 'bg-trout',
        textColor: 'text-white',
        order: 6,
        label: 'Subsidiary Organs'
    },
    'International Court of Justice': {
        bgColor: 'bg-shuttle-gray',
        textColor: 'text-white',
        order: 7,
        label: 'International Court of Justice'
    },
    'Specialized Agencies': {
        bgColor: 'bg-shuttle-gray',
        textColor: 'text-white',
        order: 8,
        label: 'Specialized Agencies'
    },
    'Related Organizations': {
        bgColor: 'bg-black',
        textColor: 'text-white',
        order: 9,
        label: 'Related Organizations'
    },
    'Other Entities': {
        bgColor: 'bg-gray-500',
        textColor: 'text-white',
        order: 10,
        label: 'Other Entities'
    },
    'Other Bodies': {
        bgColor: 'bg-pale-oyster',
        textColor: 'text-white',
        order: 11,
        label: 'Other Bodies'
    },
};

const EntityCard = ({ entity, onEntityClick }: { entity: Entity; onEntityClick: (entitySlug: string) => void }) => {
    const styles = groupStyles[entity.system_grouping] || { bgColor: 'bg-gray-400', textColor: 'text-white', order: 999, label: entity.system_grouping };
    
    // Create URL-friendly slug from entity name using utility function
    const entitySlug = createEntitySlug(entity.entity);

    // All cards take exactly 1 grid cell for uniform appearance

    const handleClick = () => {
        onEntityClick(entitySlug);
    };

    return (
        <Tooltip delayDuration={50}>
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

export default function EntitiesGrid() {
    const entities = getAllEntities();
    const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set(Object.keys(groupStyles)));
    const [searchQuery, setSearchQuery] = useState<string>('');
    const router = useRouter();

    const toggleGroup = (groupKey: string) => {
        setActiveGroups(prev => {
            // If this group is the only active one, show all groups
            if (prev.size === 1 && prev.has(groupKey)) {
                return new Set(Object.keys(groupStyles));
            }
            // Otherwise, show only this group
            return new Set([groupKey]);
        });
    };

    const handleEntityClick = (entitySlug: string) => {
        // Update URL without navigation to prevent page jumping
        router.replace(`/?entity=${entitySlug}`, { scroll: false });
    };

    // Filter and sort entities
    const visibleEntities = (searchQuery.trim() ? searchEntities(searchQuery) : entities)
        .filter((entity: Entity) => activeGroups.has(entity.system_grouping))
        .sort((a: Entity, b: Entity) => {
            // First sort by group order defined in groupStyles
            if (a.system_grouping !== b.system_grouping) {
                const orderA = groupStyles[a.system_grouping]?.order || 999;
                const orderB = groupStyles[b.system_grouping]?.order || 999;
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
                groupStyles={groupStyles}
                activeGroups={activeGroups}
                onToggleGroup={toggleGroup}
                entities={entities}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Entities Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 w-full transition-all duration-1000 ease-out">
                {visibleEntities.map((entity: Entity) => (
                    <EntityCard key={entity.entity} entity={entity} onEntityClick={handleEntityClick} />
                ))}
            </div>

            <div className="mt-4 sm:mt-6 text-gray-600 text-left transition-opacity duration-500 text-sm sm:text-base">
                Showing {visibleEntities.length} entities
            </div>
        </div>
    );
}
