'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TreemapItem {
  value: number;
  name: string;
}

interface SDGExpensesData {
  [sdg: string]: {
    total: number;
    entities: { [entity: string]: number };
  };
}

const SDG_COLORS: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D', 5: '#FF3A21',
  6: '#26BDE2', 7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367',
  11: '#FD9D24', 12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
  16: '#00689D', 17: '#19486A',
};

const SDG_SHORT_TITLES: Record<number, string> = {
  1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health and Well-being',
  4: 'Quality Education', 5: 'Gender Equality', 6: 'Clean Water and Sanitation',
  7: 'Affordable and Clean Energy', 8: 'Decent Work and Economic Growth',
  9: 'Industry, Innovation, and Infrastructure', 10: 'Reduced Inequality',
  11: 'Sustainable Cities and Communities', 12: 'Responsible Consumption and Production',
  13: 'Climate Action', 14: 'Life Below Water', 15: 'Life on Land',
  16: 'Peace, Justice, and Strong Institutions', 17: 'Partnerships for the Goals',
};

const GAP = 0.15;

function squarify(items: TreemapItem[], x: number, y: number, width: number, height: number): (Rect & { data: TreemapItem })[] {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0 || items.length === 0) return [];
  
  const normalized = items.map(item => ({
    ...item,
    normalizedValue: (item.value / total) * width * height,
  }));
  
  return slice(normalized, x, y, width, height);
}

function slice(items: (TreemapItem & { normalizedValue: number })[], x: number, y: number, width: number, height: number): (Rect & { data: TreemapItem })[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ x, y, width, height, data: items[0] }];
  }
  
  const total = items.reduce((sum, item) => sum + item.normalizedValue, 0);
  let sum = 0;
  let splitIndex = 0;
  
  for (let i = 0; i < items.length; i++) {
    sum += items[i].normalizedValue;
    if (sum >= total / 2) {
      splitIndex = i + 1;
      break;
    }
  }
  splitIndex = Math.max(1, Math.min(splitIndex, items.length - 1));
  
  const leftItems = items.slice(0, splitIndex);
  const rightItems = items.slice(splitIndex);
  const leftSum = leftItems.reduce((sum, item) => sum + item.normalizedValue, 0);
  
  if (width >= height) {
    const leftWidth = width * (leftSum / total) - GAP / 2;
    return [
      ...slice(leftItems, x, y, leftWidth, height),
      ...slice(rightItems, x + leftWidth + GAP, y, width - leftWidth - GAP, height),
    ];
  } else {
    const leftHeight = height * (leftSum / total) - GAP / 2;
    return [
      ...slice(leftItems, x, y, width, leftHeight),
      ...slice(rightItems, x, y + leftHeight + GAP, width, height - leftHeight - GAP),
    ];
  }
}

const formatBudget = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};

interface SDGExpensesTreemapProps {
  onSDGClick: (sdgNumber: number) => void;
}

export default function SDGExpensesTreemap({ onSDGClick }: SDGExpensesTreemapProps) {
  const [expensesData, setExpensesData] = useState<SDGExpensesData | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/sdg-expenses.json')
      .then((res) => res.json())
      .then(setExpensesData);
  }, []);
  
  if (!expensesData) return <div>Loading...</div>;
  
  const sdgItems: TreemapItem[] = Object.entries(expensesData)
    .map(([sdg, data]) => ({
      name: sdg,
      value: data.total,
    }))
    .sort((a, b) => b.value - a.value);
  
  const sdgRects = squarify(sdgItems, 0, 0, 100, 100);
  
  const renderEntities = (sdgNumber: number, entities: { [entity: string]: number }, x: number, y: number, width: number, height: number) => {
    const color = SDG_COLORS[sdgNumber];
    const shortTitle = SDG_SHORT_TITLES[sdgNumber];
    const entityItems = Object.entries(entities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    const rects = squarify(entityItems, x, y, width, height);
    
    return rects.map((rect, i) => {
      const showLabel = rect.width > 3 && rect.height > 2;
      const isHovered = hoveredItem === `${sdgNumber}-${rect.data.name}`;
      const isLargest = i === 0;
      
      return (
        <Tooltip key={`${sdgNumber}-${rect.data.name}-${i}`} delayDuration={50} disableHoverableContent>
          <TooltipTrigger asChild>
            <div
              className="absolute cursor-pointer text-white"
              style={{
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                backgroundColor: color,
                zIndex: isHovered ? 10 : 1,
              }}
              onMouseEnter={() => setHoveredItem(`${sdgNumber}-${rect.data.name}`)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => onSDGClick(sdgNumber)}
            >
              {isLargest ? (
                <div className="h-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 p-2 flex items-start gap-2 overflow-hidden z-20 pointer-events-none">
                    <span className="inline-block text-2xl sm:text-3xl font-bold leading-none px-1 py-0.5 flex-shrink-0" style={{ backgroundColor: color }}>
                      {sdgNumber}
                    </span>
                    <span className="inline-block text-xs sm:text-sm font-semibold leading-tight px-1 py-0.5 break-words" style={{ backgroundColor: color }}>
                      {shortTitle}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 z-10 max-h-[40%] overflow-hidden">
                    <div className="text-xs font-medium leading-tight truncate">
                      {rect.data.name}
                    </div>
                    {showLabel && (
                      <div className="text-xs opacity-70 leading-tight truncate">
                        {formatBudget(rect.data.value)}
                      </div>
                    )}
                  </div>
                </div>
              ) : showLabel && (
                <div className="p-1 h-full overflow-hidden">
                  <div className="text-xs font-medium leading-tight truncate">
                    {rect.data.name}
                  </div>
                  <div className="text-xs opacity-70 leading-tight truncate">
                    {formatBudget(rect.data.value)}
                  </div>
                </div>
              )}
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
              <p className="font-bold text-sm sm:text-base leading-tight">SDG {sdgNumber}: {shortTitle}</p>
              <p className="text-xs text-slate-600 mt-2 font-medium">{rect.data.name}</p>
              <p className="text-xs text-slate-500 mt-1">{formatBudget(rect.data.value)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    });
  };
  
  return (
    <div className="w-full h-[calc(100vh-320px)] min-h-[600px]">
      <div className="relative w-full h-full bg-gray-100">
        {sdgRects.map((sdgRect, idx) => {
          const sdgNumber = parseInt(sdgRect.data.name);
          const entities = expensesData[sdgRect.data.name].entities;
          return renderEntities(sdgNumber, entities, sdgRect.x, sdgRect.y, sdgRect.width, sdgRect.height);
        })}
      </div>
      <div className="mt-4 mb-8 text-left">
        <p className="text-base text-gray-600">As of 2024</p>
      </div>
    </div>
  );
}
