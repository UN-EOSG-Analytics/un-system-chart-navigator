'use client';

import { MemberState } from '@/types';
import { getStatusStyle, getTotalContributions } from '@/lib/memberStates';
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
    data: MemberState;
}

interface ContributionBreakdown {
    [key: string]: number;
}

const getContributionBreakdown = (contributions: Record<string, Record<string, number>>): ContributionBreakdown => {
    const breakdown: ContributionBreakdown = {};
    Object.values(contributions).forEach(entityContribs => {
        Object.entries(entityContribs).forEach(([type, amount]) => {
            breakdown[type] = (breakdown[type] || 0) + amount;
        });
    });
    return breakdown;
};

const getContributionTypeOrder = (type: string): number => {
    if (type === 'Assessed') return 0;
    if (type === 'Voluntary un-earmarked') return 1;
    if (type === 'Voluntary earmarked') return 2;
    if (type === 'Other') return 3;
    return 4;
};

const getContributionTypeColor = (type: string): string => {
    if (type === 'Assessed') return 'opacity-95';
    if (type === 'Voluntary un-earmarked') return 'opacity-85';
    if (type === 'Voluntary earmarked') return 'opacity-75';
    if (type === 'Other') return 'opacity-65';
    return 'opacity-70';
};

const GAP = 0.15;

function squarify(items: TreemapItem[], x: number, y: number, width: number, height: number): (Rect & { data: MemberState })[] {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (total === 0 || items.length === 0) return [];

    const normalized = items.map(item => ({
        ...item,
        normalizedValue: (item.value / total) * width * height
    }));

    return slice(normalized, x, y, width, height);
}

function slice(items: (TreemapItem & { normalizedValue: number })[], x: number, y: number, width: number, height: number): (Rect & { data: MemberState })[] {
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
    const rightSum = rightItems.reduce((sum, item) => sum + item.normalizedValue, 0);

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

interface MemberStatesTreemapProps {
    states: MemberState[];
    onStateClick: (state: MemberState) => void;
}

export default function MemberStatesTreemap({ states, onStateClick }: MemberStatesTreemapProps) {
    const [hoveredState, setHoveredState] = useState<string | null>(null);

    const groups = states.reduce((acc, state) => {
        const contributions = getTotalContributions(state.contributions);
        if (contributions > 0) {
            if (!acc[state.status]) {
                acc[state.status] = [];
            }
            acc[state.status].push({ value: contributions, data: state });
        }
        return acc;
    }, {} as Record<string, TreemapItem[]>);

    const sortedGroups = Object.entries(groups).sort(([statusA], [statusB]) => {
        const orderA = getStatusStyle(statusA).order;
        const orderB = getStatusStyle(statusB).order;
        return orderA - orderB;
    });

    if (sortedGroups.length === 0) {
        return (
            <div className="w-full h-[calc(100vh-280px)] min-h-[700px] flex items-center justify-center">
                <p className="text-gray-500 text-lg">No contribution data available</p>
            </div>
        );
    }

    const totalContributions = sortedGroups.reduce((sum, [, items]) => 
        sum + items.reduce((s, item) => s + item.value, 0), 0
    );

    const formatBudget = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(amount);
    };

    const getDisplayName = (name: string) => {
        return name
            .replace(/\([^)]*\)/g, '')
            .replace(/\*/g, '')
            .replace(/Special Administrative Region/gi, 'SAR')
            .trim();
    };

    const MIN_HEIGHT_THRESHOLD = 5;
    const { regularGroups, smallGroups } = sortedGroups.reduce<{
        regularGroups: Array<[string, TreemapItem[]]>,
        smallGroups: Array<[string, TreemapItem[]]>
    }>((acc, [status, groupItems]) => {
        const groupTotal = groupItems.reduce((sum, item) => sum + item.value, 0);
        const groupHeight = (groupTotal / totalContributions) * 100;
        
        if (groupHeight < MIN_HEIGHT_THRESHOLD) {
            acc.smallGroups.push([status, groupItems]);
        } else {
            acc.regularGroups.push([status, groupItems]);
        }
        return acc;
    }, { regularGroups: [], smallGroups: [] });

    const groupSpacing = GAP;
    let currentY = 0;
    
    const renderStates = (status: string, items: TreemapItem[], x: number, y: number, width: number, height: number) => {
        const styles = getStatusStyle(status);
        const sortedItems = [...items].sort((a, b) => b.value - a.value);
        const rects = squarify(sortedItems, x, y, width, height);
        
        return rects.map((rect, i) => {
            const stateContributions = getTotalContributions(rect.data.contributions);
            const breakdown = getContributionBreakdown(rect.data.contributions);
            const showLabel = rect.width > 3 && rect.height > 2;
            const isHovered = hoveredState === rect.data.name;

            const breakdownEntries = Object.entries(breakdown).sort((a, b) => 
                getContributionTypeOrder(a[0]) - getContributionTypeOrder(b[0])
            );
            const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

            return (
                <Tooltip key={`${rect.data.name}-${i}`} delayDuration={50} disableHoverableContent>
                    <TooltipTrigger asChild>
                        <div
                            data-state={rect.data.name}
                            className="absolute cursor-pointer"
                            style={{
                                left: `${rect.x}%`,
                                top: `${rect.y}%`,
                                width: `${rect.width}%`,
                                height: `${rect.height}%`,
                                zIndex: isHovered ? 10 : 1,
                            }}
                            onClick={() => onStateClick(rect.data)}
                            onMouseEnter={() => setHoveredState(rect.data.name)}
                            onMouseLeave={() => setHoveredState(null)}
                        >
                            {/* Contribution type breakdown */}
                            <div className="w-full h-full flex flex-col">
                                {breakdownEntries.map(([type, amount], idx) => {
                                    const percentage = (amount / total) * 100;
                                    const opacity = getContributionTypeColor(type);
                                    return (
                                        <div
                                            key={idx}
                                            className={`${styles.bgColor} ${opacity}`}
                                            style={{ height: `${percentage}%` }}
                                        />
                                    );
                                })}
                            </div>
                            {/* Label overlay */}
                            {showLabel && (
                                <div className={`absolute inset-0 p-1 overflow-hidden ${styles.textColor}`}>
                                    <div className="text-xs font-medium leading-tight truncate">
                                        {getDisplayName(rect.data.name)}
                                    </div>
                                    <div className="text-xs opacity-90 leading-tight truncate">
                                        {formatBudget(stateContributions)}
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
                            <p className="font-medium text-xs sm:text-sm leading-tight">{rect.data.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{styles.label}</p>
                            <p className="text-xs text-slate-600 mt-1 font-semibold">{formatBudget(stateContributions)}</p>
                            <p className="text-xs text-slate-500 mt-1 hidden sm:block">Click to view details</p>
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
                {regularGroups.slice(0, -1).map(([status, groupItems]) => {
                    const groupTotal = groupItems.reduce((sum, item) => sum + item.value, 0);
                    const groupHeight = (groupTotal / totalContributions) * 100 - groupSpacing;
                    const elements = renderStates(status, groupItems, 0, currentY, 100, groupHeight);
                    currentY += groupHeight + groupSpacing;
                    return elements;
                })}
                
                {regularGroups.length > 0 && (() => {
                    const lastRowGroups = [...regularGroups.slice(-1), ...smallGroups];
                    const lastRowTotal = lastRowGroups.reduce((sum, [, items]) => 
                        sum + items.reduce((s, item) => s + item.value, 0), 0
                    );
                    const lastRowHeight = (lastRowTotal / totalContributions) * 100 - groupSpacing;
                    
                    const groupTreemapItems = lastRowGroups.map(([status, items]) => ({
                        status,
                        value: items.reduce((sum, item) => sum + item.value, 0),
                        items
                    }));
                    
                    const groupRects = squarify(
                        groupTreemapItems.map(g => ({ value: g.value, data: { name: g.status, status: g.status as any, contributions: {} } })),
                        0, currentY, 100, lastRowHeight
                    );
                    
                    return groupRects.flatMap((groupRect, idx) => {
                        const { status, items } = groupTreemapItems[idx];
                        return renderStates(status, items, groupRect.x, groupRect.y, groupRect.width, groupRect.height);
                    });
                })()}
            </div>
        </div>
    );
}
