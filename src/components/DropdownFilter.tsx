'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DropdownFilterProps {
  groupStyles: Record<string, { bgColor: string; textColor: string; order: number; label: string }>;
  activeGroups: Set<string>;
  onToggleGroup: (groupKey: string) => void;
  entities: { system_grouping: string }[];
}

export default function DropdownFilter({ groupStyles, activeGroups, onToggleGroup, entities }: DropdownFilterProps) {
  // Count entities for each group
  const groupCounts = entities.reduce((acc, entity) => {
    acc[entity.system_grouping] = (acc[entity.system_grouping] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check if all groups are active (showing all) or only specific ones are filtered
  const allGroupsActive = activeGroups.size === Object.keys(groupStyles).length;

  // Sort groups by their order
  const sortedGroups = Object.entries(groupStyles).sort(([, a], [, b]) => a.order - b.order);

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
          <div className="w-5 h-5 rounded border border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0"></div>
          <span className="font-medium">All Categories ({totalEntities})</span>
        </div>
      );
    }
    
    if (activeGroups.size === 1) {
      const activeGroup = Array.from(activeGroups)[0];
      const styles = groupStyles[activeGroup];
      const count = groupCounts[activeGroup] || 0;
      return (
        <div className="flex items-center gap-3">
          <div className={`${styles.bgColor} w-5 h-5 rounded flex-shrink-0`}></div>
          <span className="font-medium">{styles.label} ({count})</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded border border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0"></div>
        <span className="font-medium">All Categories ({entities.length})</span>
      </div>
    );
  };

  return (
    <div className="mb-8 mt-6 w-full">
      <div className="flex items-center justify-start w-full" style={{ willChange: 'auto' }}>
        <div className="relative w-[320px]" style={{ contain: 'layout' }}>
          <Select value={getSelectedValue()} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full h-10 bg-white" id="category-filter">
              <SelectValue asChild>
                <span className="flex items-center">{getDisplayText()}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent 
              className="w-[320px] bg-white z-50" 
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
            <SelectItem value="all">
              <div className="flex items-center gap-3 py-1">
                <div className="w-5 h-5 rounded border border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0"></div>
                <span className="font-medium">All Categories ({entities.length})</span>
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
      </div>
    </div>
  );
}