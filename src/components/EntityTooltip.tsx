import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { hideTooltipEntities } from "@/lib/constants";
import { Entity } from "@/types/entity";
import { useState, useRef } from "react";

interface EntityTooltipProps {
  entity: Entity;
  children: React.ReactNode;
}

export default function EntityTooltip({
  entity,
  children,
}: EntityTooltipProps) {
  const [open, setOpen] = useState(false);
  const blockedRef = useRef(false);

  // Skip tooltip for specified entities
  if (hideTooltipEntities.has(entity.entity)) {
    return <>{children}</>;
  }

  const handlePointerDown = () => {
    // Immediately close and block tooltip from reopening during/after click.
    // Without this, router.replace() in handleEntityClick triggers a re-render
    // that resets Radix hover state, causing a visible open→close→open flicker.
    setOpen(false);
    blockedRef.current = true;
    setTimeout(() => {
      blockedRef.current = false;
    }, 600);
  };

  return (
    <Tooltip
      open={open}
      onOpenChange={(v) => {
        if (!blockedRef.current) setOpen(v);
      }}
      delayDuration={500}
      disableHoverableContent
    >
      <TooltipTrigger asChild onPointerDown={handlePointerDown}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="w-fit max-w-xs border border-slate-200 bg-white text-left text-slate-800 shadow-lg"
        hideWhenDetached
        avoidCollisions={true}
        collisionPadding={12}
      >
        <div className="p-1">
          <p className="text-left text-xs leading-tight font-medium text-wrap sm:text-sm">
            {entity.entity_long} ({entity.entity})
          </p>
          <p className="mt-0.5 hidden text-left text-xs text-wrap text-slate-500 sm:block">
            Click to view details
          </p>
          <p className="mt-1 text-left text-xs text-wrap text-slate-500 sm:hidden">
            Tap to view details
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
