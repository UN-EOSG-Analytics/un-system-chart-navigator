import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Entity } from "@/types/entity";

interface EntityTooltipProps {
  entity: Entity;
  children: React.ReactNode;
}

export default function EntityTooltip({
  entity,
  children,
}: EntityTooltipProps) {
  return (
    <Tooltip delayDuration={50} disableHoverableContent>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="max-w-xs border border-slate-200 bg-white text-left text-slate-800 shadow-lg sm:max-w-sm"
        hideWhenDetached
        avoidCollisions={true}
        collisionPadding={12}
      >
        <div className="max-w-xs p-1 sm:max-w-sm">
          <p className="text-left text-xs leading-tight font-medium sm:text-sm">
            {entity.entity_long} ({entity.entity})
          </p>
          <p className="mt-1 hidden text-left text-xs text-slate-500 sm:block">
            Click to view entity details
          </p>
          <p className="mt-1 text-left text-xs text-slate-500 sm:hidden">
            Tap to view details
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
