'use client';

import { useEntities } from '@/hooks/useEntities';
import { Entity } from '@/types/entity';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Color mapping for different groups using Tailwind built-in colors
const groupColors: Record<string, string> = {
  'UN Secretariat': 'bg-un-system-yellow',
  'Peacekeeping Operations, Political Missions, etc.': 'bg-un-red',
  'Specialized Agencies': 'bg-shuttle-gray',
  'Regional Commissions': 'bg-camouflage-green',
  'Related Organizations': 'bg-pale-oyster',
//   'Subsidiary Organs': 'bg-',
  'Other Bodies': 'bg-trout',
  'Other Entities': 'bg-shuttle-gray',
};

const EntityCard = ({ entity }: { entity: Entity }) => {
  const colorClass = groupColors[entity.group] || 'bg-gray-400';
  const textColorClass = entity.group === 'UN Secretariat' ? 'text-pale-oyster' : 'text-white';
  
  const handleClick = () => {
    if (entity.entity_url) {
      window.open(entity.entity_url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`${colorClass} ${textColorClass} p-2 rounded-lg h-[55px] w-[140px] flex items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-200 ${
            entity.entity_url ? 'cursor-pointer hover:scale-105' : 'cursor-default'
          }`}
          onClick={handleClick}
        >
          <span className="font-medium text-base leading-tight">{entity.entity}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-white text-slate-800 border border-slate-200 shadow-lg" hideWhenDetached>
        <div className="text-center max-w-xs">
          <p className="font-medium text-sm leading-tight">{entity.combined}</p>
          {entity.entity_url && (
            <p className="text-xs text-slate-500 mt-1">Click to visit website</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default function EntitiesGrid() {
  const { data, loading, error } = useEntities({ limit: 1000 }); // Limit to 60 entities for better display

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading entities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">Error loading entities: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  // Show all entities and sort by group first, then alphabetically
  const visibleEntities = data.entities
    .sort((a: Entity, b: Entity) => {
      // First sort by group - UN Secretariat goes first
      if (a.group !== b.group) {
        if (a.group === 'UN Secretariat') return -1;
        if (b.group === 'UN Secretariat') return 1;
        return a.group.localeCompare(b.group);
      }
      // Then sort alphabetically by entity name within the same group
      return a.entity.localeCompare(b.entity);
    });

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-10 mt-6 pb-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl">
          {Object.entries(groupColors).map(([group, colorClass]) => (
            <div key={group} className="flex items-center gap-3 p-2">
              <div className={`${colorClass} w-4 h-4 rounded`}></div>
              <span className="text-sm">{group}</span>
            </div>
          ))}
        </div>
      </div>

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
