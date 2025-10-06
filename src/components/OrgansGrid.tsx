'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Organ } from '@/types/organ';
import { useRouter } from 'next/navigation';
import { getAllOrgans, createOrganSlug, getOrganTypeStyle } from '@/lib/organs';

const OrganCard = ({ organ, onOrganClick }: { organ: Organ; onOrganClick: (organSlug: string) => void }) => {
    const organSlug = createOrganSlug(organ.short_name);
    const styles = getOrganTypeStyle(organ.type);

    const handleClick = () => {
        onOrganClick(organSlug);
    };

    return (
        <Tooltip delayDuration={50} disableHoverableContent>
            <TooltipTrigger asChild>
                <div
                    data-organ={organ.short_name}
                    onClick={handleClick}
                    className={`${styles.bgColor} ${styles.textColor} h-[50px] sm:h-[55px] p-2 rounded-lg flex items-center justify-center text-center cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 touch-manipulation`}
                >
                    <span className="font-medium text-xs sm:text-sm leading-tight">{organ.short_name}</span>
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
                    <p className="font-medium text-xs sm:text-sm leading-tight">{organ.long_name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{organ.type}</p>
                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Click to view organ details</p>
                    <p className="text-xs text-slate-500 mt-1 sm:hidden">Tap to view details</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

export default function OrgansGrid() {
    const organs = getAllOrgans();
    const router = useRouter();

    const handleOrganClick = (organSlug: string) => {
        router.replace(`/?organ=${organSlug}`, { scroll: false });
    };

    const sortedOrgans = [...organs].sort((a, b) => {
        const styleA = getOrganTypeStyle(a.type);
        const styleB = getOrganTypeStyle(b.type);
        if (styleA.order !== styleB.order) return styleA.order - styleB.order;
        return a.short_name.localeCompare(b.short_name);
    });

    return (
        <div className="w-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 w-full">
                {sortedOrgans.map((organ: Organ) => (
                    <OrganCard key={organ.short_name} organ={organ} onOrganClick={handleOrganClick} />
                ))}
            </div>
        </div>
    );
}
