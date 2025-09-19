interface LegendProps {
  groupStyles: Record<string, { bgColor: string; textColor: string; order: number; label: string }>;
  activeGroups: Set<string>;
  onToggleGroup: (groupKey: string) => void;
  entities: { system_grouping: string }[];
}

export default function Legend({ groupStyles, activeGroups, onToggleGroup, entities }: LegendProps) {
  // Count entities for each group
  const groupCounts = entities.reduce((acc, entity) => {
    acc[entity.system_grouping] = (acc[entity.system_grouping] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check if all groups are active (showing all) or only specific ones are filtered
  const allGroupsActive = activeGroups.size === Object.keys(groupStyles).length;

  return (
    <div className="mb-10 mt-6 pb-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl">
        {Object.entries(groupStyles).map(([group, styles]) => {
          const isActive = activeGroups.has(group);
          const count = groupCounts[group] || 0;
          return (
            <div 
              key={group} 
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                allGroupsActive ? 'opacity-100' : (isActive ? 'opacity-100' : 'opacity-30')
              }`}
              onClick={() => onToggleGroup(group)}
            >
              <div className={`${styles.bgColor} w-5 h-5 rounded flex-shrink-0 ${
                allGroupsActive ? '' : (isActive ? '' : 'grayscale')
              }`}></div>
              <span className={`text-base font-medium ${
                allGroupsActive ? 'text-gray-900' : (isActive ? 'text-gray-900' : 'text-gray-400')
              }`}>{styles.label} ({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
