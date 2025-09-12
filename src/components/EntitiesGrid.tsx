'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Entity } from '@/types/entity';
import Legend from './Legend';
import { useState } from 'react';
import Link from 'next/link';
import { getAllEntities } from '@/data/entities';
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

const EntityCard = ({ entity }: { entity: Entity }) => {
    const styles = groupStyles[entity.group] || { bgColor: 'bg-gray-400', textColor: 'text-white', order: 999, label: entity.group };
    
    // Create URL-friendly slug from entity name using utility function
    const entitySlug = createEntitySlug(entity.entity);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href={`/?entity=${entitySlug}`} prefetch={false}>
                    <div
                        className={`${styles.bgColor} ${styles.textColor} p-2 rounded-lg h-[55px] w-[140px] flex items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105`}
                    >
                        <span className="font-medium text-base leading-tight">{entity.entity}</span>
                    </div>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-white text-slate-800 border border-slate-200 shadow-lg" hideWhenDetached>
                <div className="text-center max-w-xs">
                    <p className="font-medium text-sm leading-tight">{entity.combined}</p>
                    <p className="text-xs text-slate-500 mt-1">Click to view details</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

export default function EntitiesGrid() {
    const entities = getAllEntities();
    const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set(Object.keys(groupStyles)));

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

    // Filter and sort entities
    const visibleEntities = entities
        .filter((entity: Entity) => activeGroups.has(entity.group))
        .sort((a: Entity, b: Entity) => {
            // First sort by group order defined in groupStyles
            if (a.group !== b.group) {
                const orderA = groupStyles[a.group]?.order || 999;
                const orderB = groupStyles[b.group]?.order || 999;
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
            {/* Legend */}
            <Legend 
                groupStyles={groupStyles} 
                activeGroups={activeGroups}
                onToggleGroup={toggleGroup}
                entities={entities}
            />

            {/* Entities Grid */}
            <div className="flex flex-wrap gap-3 justify-start w-full">
                {visibleEntities.map((entity: Entity) => (
                    <EntityCard key={entity.entity} entity={entity} />
                ))}
            </div>

            <div className="mt-6 text-gray-600 text-left">
                Showing {visibleEntities.length} entities
            </div>
        </div>
    );
}
