import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Entity } from '@/types/entity';

interface EntityTooltipProps {
    entity: Entity;
    children: React.ReactNode;
}

export default function EntityTooltip({ entity, children }: EntityTooltipProps) {
    return (
        <Tooltip delayDuration={50} disableHoverableContent>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent
                side="top"
                sideOffset={8}
                className="bg-white text-slate-800 border border-slate-200 shadow-lg max-w-xs sm:max-w-sm text-left"
                hideWhenDetached
                avoidCollisions={true}
                collisionPadding={12}
            >
                <div className="max-w-xs sm:max-w-sm p-1">
                    <p className="font-medium text-xs sm:text-sm leading-tight text-left">{entity.entity_long}</p>
                    <p className="text-xs text-slate-500 mt-1 hidden sm:block text-left">Click to view entity details</p>
                    <p className="text-xs text-slate-500 mt-1 sm:hidden text-left">Tap to view details</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
