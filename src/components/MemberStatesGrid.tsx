'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MemberState } from '@/types';
import { useState } from 'react';
import { getAllMemberStates, getStatusStyle, getTotalContributions } from '@/lib/memberStates';
import { formatBudget } from '@/lib/entities';
import MemberStateModal from './MemberStateModal';
import MemberStatesTreemap from './MemberStatesTreemap';
import { Switch } from '@/components/ui/switch';

const MemberStateCard = ({ state, onClick }: { state: MemberState; onClick: () => void }) => {
    const styles = getStatusStyle(state.status);
    const totalContributions = getTotalContributions(state.contributions);
    
    const getDisplayName = (name: string) => {
        return name
            .replace(/\([^)]*\)/g, '')
            .replace(/\*/g, '')
            .replace(/Special Administrative Region/gi, 'SAR')
            .trim();
    };

    return (
        <Tooltip delayDuration={50} disableHoverableContent>
            <TooltipTrigger asChild>
                <div
                    onClick={onClick}
                    className={`${styles.bgColor} ${styles.textColor} h-[50px] sm:h-[55px] p-2 rounded-lg flex items-center justify-center text-center cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 touch-manipulation`}
                >
                    <span className="font-medium text-[10px] sm:text-xs leading-tight break-words hyphens-auto" lang="en">{getDisplayName(state.name)}</span>
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
                    <p className="font-medium text-xs sm:text-sm leading-tight">{state.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{styles.label}</p>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">{formatBudget(totalContributions)}</p>
                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Click to view details</p>
                    <p className="text-xs text-slate-500 mt-1 sm:hidden">Tap to view details</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

export default function MemberStatesGrid() {
    const [selectedState, setSelectedState] = useState<MemberState | null>(null);
    const [showTreemap, setShowTreemap] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [displayTreemap, setDisplayTreemap] = useState<boolean>(false);
    
    const memberStates = getAllMemberStates().sort((a, b) => {
        const aStyle = getStatusStyle(a.status);
        const bStyle = getStatusStyle(b.status);
        if (aStyle.order !== bStyle.order) return aStyle.order - bStyle.order;
        return a.name.localeCompare(b.name);
    });

    const toggleTreemap = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setDisplayTreemap(prev => !prev);
        setTimeout(() => setShowTreemap(prev => !prev), 400);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const typeOpacity = (t: string) => t === 'Assessed' ? 'opacity-95' : t === 'Voluntary un-earmarked' ? 'opacity-85' : t === 'Voluntary earmarked' ? 'opacity-75' : t === 'Other' ? 'opacity-65' : 'opacity-70';

    return (
        <div className="w-full">
            <div className="mb-4 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-700">
                    Contributions
                </span>
                <Switch
                    checked={showTreemap}
                    onCheckedChange={toggleTreemap}
                />
                {showTreemap && (
                    <div className="ml-2 flex items-center gap-3 text-[10px] text-slate-700">
                        {['Assessed','Voluntary un-earmarked','Voluntary earmarked','Other'].map(t => (
                            <div key={t} className="flex items-center gap-2">
                                <span className={`h-2 w-4 rounded bg-camouflage-green ${typeOpacity(t)}`}></span>
                                <span className="hidden sm:inline">{t}</span>
                                <span className="sm:hidden">{t.replace('Voluntary ','V ').replace('un-earmarked','un-EM').replace('earmarked','EM')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative w-full" data-view-container>
                <div 
                    className="transition-opacity duration-500 ease-in-out"
                    style={{ opacity: displayTreemap === showTreemap ? 1 : 0 }}
                >
                    {showTreemap ? (
                        <MemberStatesTreemap 
                            states={memberStates}
                            onStateClick={setSelectedState}
                        />
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 w-full">
                            {memberStates.map((state) => (
                                <MemberStateCard key={state.name} state={state} onClick={() => setSelectedState(state)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedState && (
                <MemberStateModal memberState={selectedState} onClose={() => setSelectedState(null)} />
            )}
        </div>
    );
}
