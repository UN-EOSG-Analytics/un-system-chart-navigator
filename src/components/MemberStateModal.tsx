'use client';

import { MemberState } from '@/types';
import { X, Info } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatusStyle, getTotalContributions, getAllMemberStates, getPaymentStatusStyle } from '@/lib/memberStates';
import { formatBudget } from '@/lib/entities';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { createEntitySlug } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface MemberStateModalProps {
    memberState: MemberState | null;
    onClose: () => void;
}

const getContributionBreakdown = (contributions: Record<string, Record<string, number>>): Record<string, number> => {
    const breakdown: Record<string, number> = {};
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
    if (type === 'Assessed') return 'bg-gray-900';
    if (type === 'Voluntary un-earmarked') return 'bg-gray-700';
    if (type === 'Voluntary earmarked') return 'bg-gray-500';
    if (type === 'Other') return 'bg-gray-400';
    return 'bg-gray-500';
};

const formatBudgetFixed = (amount: number): string => {
    // Format with consistent width for right alignment
    if (amount >= 1_000_000_000) {
        return `$${(amount / 1_000_000_000).toFixed(2)}B`;
    } else if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(2)}M`;
    } else if (amount >= 1_000) {
        return `$${(amount / 1_000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
};

export default function MemberStateModal({ memberState, onClose }: MemberStateModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [showAllEntities, setShowAllEntities] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    }, [onClose]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [handleClose]);

    const minSwipeDistance = 50;
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        if (touchStart - touchEnd < -minSwipeDistance) handleClose();
    };

    useEffect(() => {
        const originalOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        return () => { document.documentElement.style.overflow = originalOverflow; };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) handleClose();
    };

    if (!memberState) return null;

    const statusStyle = getStatusStyle(memberState.status);
    const totalContributions = getTotalContributions(memberState.contributions);
    const breakdown = getContributionBreakdown(memberState.contributions);
    const breakdownEntries = Object.entries(breakdown).sort((a, b) => 
        getContributionTypeOrder(a[0]) - getContributionTypeOrder(b[0])
    );

    const totalAssessed = Object.values(memberState.contributions).reduce((sum, types) => {
        return sum + (types['Assessed'] || 0);
    }, 0);

    const allStates = getAllMemberStates();
    const totalAllAssessed = allStates.reduce((sum, state) => {
        return sum + Object.values(state.contributions).reduce((s, types) => {
            return s + (types['Assessed'] || 0);
        }, 0);
    }, 0);

    const entityContributions = Object.entries(memberState.contributions).map(([entity, types]) => {
        const total = Object.values(types).reduce((sum, val) => sum + val, 0);
        const percentage = totalAssessed > 0 ? (total / totalAssessed) * 100 : (total / totalContributions) * 100;
        
        const totalEntitySpending = allStates.reduce((sum, state) => {
            return sum + (state.contributions[entity] 
                ? Object.values(state.contributions[entity]).reduce((s, val) => s + val, 0)
                : 0);
        }, 0);
        
        const avgOthersPercentage = totalAllAssessed > 0 
            ? (totalEntitySpending / totalAllAssessed) * 100 
            : 0;
        
        return {
            entity,
            total,
            percentage,
            typeBreakdown: types,
            avgOthersPercentage,
            avgTypeBreakdown: {}
        };
    }).sort((a, b) => b.total - a.total);

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="px-6 sm:px-8 pt-4 sm:pt-6 pb-2 sm:pb-3 border-b border-gray-300 sticky top-0 bg-white">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 leading-tight flex-1">
                            {memberState.name}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ease-out touch-manipulation text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-100 cursor-pointer focus:outline-none focus:bg-gray-400 focus:text-gray-100 flex-shrink-0"
                            aria-label="Close modal"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <div className="px-6 sm:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 space-y-6">
                    <div>
                        <h3 className="text-lg sm:text-xl font-normal text-gray-900 mb-3 uppercase tracking-wider">Overview</h3>
                        <div>
                            <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">Status</span>
                            <div className="mt-0.5">
                                <span className={`inline-block px-3 py-1 ${statusStyle.bgColor} ${statusStyle.textColor} rounded-full text-sm font-medium`}>
                                    {statusStyle.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg sm:text-xl font-normal text-gray-900 mb-3 uppercase tracking-wider">Contributions</h3>
                        
                        {memberState.payment_status && (
                            <div className="mb-4">
                                <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">Payment Date</span>
                                <div className="mt-0.5 flex items-center gap-2">
                                    {memberState.payment_date && (
                                        <span className="text-base text-gray-700 font-semibold">
                                            {(() => {
                                                // Parse date like "7-Jan-25"
                                                const parts = memberState.payment_date.split('-');
                                                if (parts.length === 3) {
                                                    const months: Record<string, string> = {
                                                        'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 
                                                        'Apr': 'April', 'May': 'May', 'Jun': 'June',
                                                        'Jul': 'July', 'Aug': 'August', 'Sep': 'September',
                                                        'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
                                                    };
                                                    return `${months[parts[1]] || parts[1]} ${parseInt(parts[0])}, 20${parts[2]}`;
                                                }
                                                return memberState.payment_date;
                                            })()}
                                        </span>
                                    )}
                                    <span className={`inline-block px-2.5 py-0.5 ${getPaymentStatusStyle(memberState.payment_status)?.bgColor} ${getPaymentStatusStyle(memberState.payment_status)?.textColor} rounded-full text-xs font-medium`}>
                                        {getPaymentStatusStyle(memberState.payment_status)?.label}
                                    </span>
                                </div>
                                <div className="text-gray-500 text-xs mt-0.5">
                                    2025 Assessed Contributions
                                </div>
                            </div>
                        )}

                        <div className="mt-3">
                            <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">Total</span>
                            <div className="mt-0.5">
                                <div className="text-gray-700 text-base font-semibold">{formatBudget(totalContributions)}</div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">By Type</span>
                            <div className="mt-2 space-y-2">
                                {breakdownEntries.map(([type, amount]) => (
                                    <div key={type} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getContributionTypeColor(type)}`} />
                                            <span className="text-sm text-gray-600">{type}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{formatBudget(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">By Entity</span>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 mb-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex h-2 w-8 rounded-sm overflow-hidden">
                                        <div className="bg-gray-900 flex-1" />
                                        <div className="bg-gray-700 flex-1" />
                                        <div className="bg-gray-500 flex-1" />
                                        <div className="bg-gray-400 flex-1" />
                                    </div>
                                    <span>{memberState.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-8 rounded-sm bg-gray-300" />
                                    <span>Global average</span>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-md bg-white text-slate-800 border border-slate-200">
                                        <div className="text-xs space-y-2">
                                            <p className="font-semibold">How to read this chart</p>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex h-2 w-8 rounded-sm overflow-hidden flex-shrink-0">
                                                        <div className="bg-gray-900 flex-1" />
                                                        <div className="bg-gray-700 flex-1" />
                                                        <div className="bg-gray-500 flex-1" />
                                                        <div className="bg-gray-400 flex-1" />
                                                    </div>
                                                    <p className="font-medium">{memberState.name}&apos;s bars</p>
                                                </div>
                                                <p className="text-gray-600">Show contributions of {memberState.name} per entity, split by contribution type:</p>
                                                <div className="ml-2 space-y-0.5 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gray-900" />
                                                        <span className="text-gray-600">Assessed</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gray-700" />
                                                        <span className="text-gray-600">Voluntary un-earmarked</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                                                        <span className="text-gray-600">Voluntary earmarked</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                                                        <span className="text-gray-600">Other</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium">Percentage score</p>
                                                <p className="text-gray-600">For each entity, the percentage shows {memberState.name}&apos;s contributions to that entity divided by {memberState.name}&apos;s total assessed contributions to all entities.</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="h-2 w-8 rounded-sm bg-gray-300 flex-shrink-0" />
                                                    <p className="font-medium">Global average bars</p>
                                                </div>
                                                <p className="text-gray-600">Shows the percentage of all member states&apos; contributions to that entity divided by all states&apos; total assessed contributions. Provides context for comparison.</p>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        <div className="space-y-1.5">
                            {(() => {
                                const displayedEntities = showAllEntities ? entityContributions : entityContributions.slice(0, 10);
                                const maxPercentage = Math.max(...entityContributions.map(c => Math.max(c.percentage, c.avgOthersPercentage)));
                                
                                return (
                                    <>
                                        {displayedEntities.map((contrib) => {
                                            const typeEntries = Object.entries(contrib.typeBreakdown).sort((a, b) => 
                                                getContributionTypeOrder(a[0]) - getContributionTypeOrder(b[0])
                                            );
                                            const normalizedPercentage = (contrib.percentage / maxPercentage) * 100;
                                            const normalizedAvgPercentage = (contrib.avgOthersPercentage / maxPercentage) * 100;
                                            
                                            return (
                                                <div key={contrib.entity} className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const entitySlug = createEntitySlug(contrib.entity);
                                                            router.replace(`/?entity=${entitySlug}`, { scroll: false });
                                                        }}
                                                        className="w-20 text-xs text-gray-700 font-medium truncate flex-shrink-0 text-left hover:text-gray-900 hover:underline cursor-pointer"
                                                        title={`View ${contrib.entity}`}
                                                    >
                                                        {contrib.entity}
                                                    </button>
                                                    <div className="flex-1 flex flex-col gap-px">
                                                        {/* This state's bar */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="h-2 rounded-sm overflow-hidden flex cursor-help" style={{ width: `${normalizedPercentage}%` }}>
                                                                    {typeEntries.map(([type, amount]) => {
                                                                        const typePercentage = (amount / contrib.total) * 100;
                                                                        return typePercentage > 0 ? (
                                                                            <div
                                                                                key={type}
                                                                                className={`${getContributionTypeColor(type)} transition-all`}
                                                                                style={{ width: `${typePercentage}%` }}
                                                                            />
                                                                        ) : null;
                                                                    })}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="max-w-xs bg-white text-slate-800 border border-slate-200">
                                                                <div className="text-xs space-y-1">
                                                                    <div className="font-semibold mb-1">
                                                                        {formatBudget(contrib.total)}
                                                                        {totalAssessed > 0 && (
                                                                            <div className="text-gray-600 font-normal mt-1">
                                                                                {memberState.name}&apos;s contributions to {contrib.entity} as percentage of {memberState.name}&apos;s assessed contributions: {contrib.percentage.toFixed(0)}%
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {typeEntries.map(([type, amount]) => (
                                                                        <div key={type} className="flex items-center gap-2">
                                                                            <div className={`w-2 h-2 rounded-full ${getContributionTypeColor(type)}`} />
                                                                            <span className="flex-1">{type}</span>
                                                                            <span className="font-semibold">{formatBudget(amount)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        
                                                        {/* Average bar */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="h-2 rounded-sm overflow-hidden flex cursor-help bg-gray-300" style={{ width: `${normalizedAvgPercentage}%` }}>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="max-w-xs bg-white text-slate-800 border border-slate-200">
                                                                <div className="text-xs">
                                                                    {totalAssessed > 0 ? (
                                                                        <div>Overall global contributions to {contrib.entity} as percentage of global assessed contributions: {contrib.avgOthersPercentage.toFixed(0)}%</div>
                                                                    ) : (
                                                                        <div>Global average contribution</div>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <div className="text-xs text-gray-500 w-20 text-right flex-shrink-0">
                                                        {formatBudgetFixed(contrib.total)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {!showAllEntities && entityContributions.length > 10 && (
                                            <button
                                                onClick={() => setShowAllEntities(true)}
                                                className="text-xs text-gray-600 hover:text-gray-900 underline mt-2"
                                            >
                                                Show all {entityContributions.length} entities
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
