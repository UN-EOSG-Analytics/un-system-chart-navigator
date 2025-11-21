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
        className="w-fit max-w-xs border border-slate-200 bg-white text-left text-slate-800 shadow-lg"
        hideWhenDetached
        avoidCollisions={true}
        collisionPadding={12}
      >
        <div className="p-1">
          <p className="text-left text-xs font-medium leading-tight text-wrap sm:text-sm">
            {entity.entity_long} ({entity.entity})
          </p>
          <p className="mt-1 hidden text-left text-xs text-slate-500 text-wrap sm:block">
            Click to view entity details
          </p>
          <p className="mt-1 text-left text-xs text-slate-500 text-wrap sm:hidden">
            Tap to view details
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
