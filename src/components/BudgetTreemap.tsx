'use client';

import { Entity } from '@/types';
import { budgetData } from '@/lib/entities';
import { systemGroupingStyles, getSystemGroupingStyle } from '@/lib/systemGroupings';
import { createEntitySlug } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface TreemapItem {
    value: number;
    data: Entity;
}

const GAP = 0.15;

function squarify(items: TreemapItem[], x: number, y: number, width: number, height: number): (Rect & { data: Entity })[] {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (total === 0 || items.length === 0) return [];

    const normalized = items.map(item => ({
        ...item,
        normalizedValue: (item.value / total) * width * height
    }));

    return slice(normalized, x, y, width, height);
}

function slice(items: (TreemapItem & { normalizedValue: number })[], x: number, y: number, width: number, height: number): (Rect & { data: Entity })[] {
    if (items.length === 0) return [];
    if (items.length === 1) {
        return [{ x, y, width, height, data: items[0].data }];
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
            ...slice(rightItems, x + leftWidth + GAP, y, width - leftWidth - GAP, height)
        ];
    } else {
        const leftHeight = height * (leftSum / total) - GAP / 2;
        return [
            ...slice(leftItems, x, y, width, leftHeight),
            ...slice(rightItems, x, y + leftHeight + GAP, width, height - leftHeight - GAP)
        ];
    }
}

interface BudgetTreemapProps {
    entities: Entity[];
    onEntityClick: (entitySlug: string) => void;
    activeGroups: Set<string>;
}

export default function BudgetTreemap({ entities, onEntityClick }: BudgetTreemapProps) {
    const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

    const groups = entities.reduce((acc, entity) => {
        const budget = budgetData[entity.entity]?.amount || 0;
        if (budget > 0) {
            if (!acc[entity.system_grouping]) {
                acc[entity.system_grouping] = [];
            }
            acc[entity.system_grouping].push({ value: budget, data: entity });
        }
        return acc;
    }, {} as Record<string, TreemapItem[]>);

    const sortedGroups = Object.entries(groups).sort(([groupA], [groupB]) => {
        const orderA = getSystemGroupingStyle(groupA).order;
        const orderB = getSystemGroupingStyle(groupB).order;
        return orderA - orderB;
    });

    if (sortedGroups.length === 0) {
        return (
            <div className="w-full h-[calc(100vh-280px)] min-h-[700px] flex items-center justify-center">
                <p className="text-gray-500 text-lg">No budget data available</p>
            </div>
        );
    }

    const totalBudget = sortedGroups.reduce((sum, [, items]) => 
        sum + items.reduce((s, item) => s + item.value, 0), 0
    );

    const MIN_HEIGHT_THRESHOLD = 5;
    const { regularGroups, smallGroups } = sortedGroups.reduce<{
        regularGroups: Array<[string, TreemapItem[]]>,
        smallGroups: Array<[string, TreemapItem[]]>
    }>((acc, [groupKey, groupItems]) => {
        const groupTotal = groupItems.reduce((sum, item) => sum + item.value, 0);
        const groupHeight = (groupTotal / totalBudget) * 100;
        
        if (groupHeight < MIN_HEIGHT_THRESHOLD) {
            acc.smallGroups.push([groupKey, groupItems]);
        } else {
            acc.regularGroups.push([groupKey, groupItems]);
        }
        return acc;
    }, { regularGroups: [], smallGroups: [] });

    const formatBudget = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(amount);
    };

    const groupSpacing = GAP;
    let currentY = 0;
    
    const renderEntities = (groupKey: string, items: TreemapItem[], x: number, y: number, width: number, height: number) => {
        const styles = systemGroupingStyles[groupKey];
        const sortedItems = [...items].sort((a, b) => b.value - a.value);
        const rects = squarify(sortedItems, x, y, width, height);
        
        return rects.map((rect, i) => {
            const entityBudget = budgetData[rect.data.entity]?.amount || 0;
            const showLabel = rect.width > 3 && rect.height > 2;
            const isHovered = hoveredEntity === rect.data.entity;

            return (
                <Tooltip key={`${rect.data.entity}-${i}`} delayDuration={50} disableHoverableContent>
                    <TooltipTrigger asChild>
                        <div
                            data-entity={rect.data.entity}
                            className={`absolute cursor-pointer ${styles.bgColor} ${styles.textColor}`}
                            style={{
                                left: `${rect.x}%`,
                                top: `${rect.y}%`,
                                width: `${rect.width}%`,
                                height: `${rect.height}%`,
                                opacity: isHovered ? 1 : 0.9,
                                zIndex: isHovered ? 10 : 1,
                            }}
                            onClick={() => onEntityClick(createEntitySlug(rect.data.entity))}
                            onMouseEnter={() => setHoveredEntity(rect.data.entity)}
                            onMouseLeave={() => setHoveredEntity(null)}
                        >
                            {showLabel && (
                                <div className="p-1 h-full overflow-hidden">
                                    <div className="text-xs font-medium leading-tight truncate">
                                        {rect.data.entity}
                                    </div>
                                    <div className="text-xs opacity-70 leading-tight truncate transition-opacity duration-300">
                                        {formatBudget(entityBudget)}
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
                            <p className="font-medium text-xs sm:text-sm leading-tight">{rect.data.entity_long}</p>
                            <p className="text-xs text-slate-600 mt-1">{formatBudget(entityBudget)}</p>
                            <p className="text-xs text-slate-500 mt-1 hidden sm:block">Click to view entity details</p>
                            <p className="text-xs text-slate-500 mt-1 sm:hidden">Tap to view details</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            );
        });
    };

    return (
        <div className="w-full h-[calc(100vh-280px)] min-h-[700px]">
            <div className="relative w-full h-full bg-gray-100">
                {regularGroups.slice(0, -1).map(([groupKey, groupItems]) => {
                    const groupTotal = groupItems.reduce((sum, item) => sum + item.value, 0);
                    const groupHeight = (groupTotal / totalBudget) * 100 - groupSpacing;
                    const entities = renderEntities(groupKey, groupItems, 0, currentY, 100, groupHeight);
                    currentY += groupHeight + groupSpacing;
                    return entities;
                })}
                
                {regularGroups.length > 0 && (() => {
                    const lastRowGroups = [...regularGroups.slice(-1), ...smallGroups];
                    const lastRowTotal = lastRowGroups.reduce((sum, [, items]) => 
                        sum + items.reduce((s, item) => s + item.value, 0), 0
                    );
                    const lastRowHeight = (lastRowTotal / totalBudget) * 100 - groupSpacing;
                    
                    const groupTreemapItems = lastRowGroups.map(([groupKey, items]) => ({
                        groupKey,
                        value: items.reduce((sum, item) => sum + item.value, 0),
                        items
                    }));
                    
                    const groupRects = squarify(
                        groupTreemapItems.map(g => ({ value: g.value, data: { entity: g.groupKey, system_grouping: g.groupKey } as Entity })),
                        0, currentY, 100, lastRowHeight
                    );
                    
                    return groupRects.flatMap((groupRect, idx) => {
                        const { groupKey, items } = groupTreemapItems[idx];
                        return renderEntities(groupKey, items, groupRect.x, groupRect.y, groupRect.width, groupRect.height);
                    });
                })()}
            </div>
        </div>
    );
}