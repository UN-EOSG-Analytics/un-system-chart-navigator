import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  affiliatedEntities,
  chipTooltips,
  hideTooltipEntities,
  principalOrganConfigs,
} from "@/lib/constants";
import { getCssColorVarDark, normalizePrincipalOrgan } from "@/lib/utils";
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

  // Custom tooltip text overrides the default "long name (acronym)" content.
  const customTooltip = chipTooltips[entity.entity];

  // Affiliation label (e.g. "UNDP-affiliated") shown for subsidiary entities,
  // tinted with the dark variant of the entity's organ color (matching the chip).
  const affiliationLabel = affiliatedEntities[entity.entity]?.subtitle;
  const organBgColor =
    principalOrganConfigs[normalizePrincipalOrgan(entity.un_principal_organ)?.[0] ?? ""]
      ?.bgColor;
  const affiliationColor = organBgColor
    ? getCssColorVarDark(organBgColor)
    : undefined;

  // Skip tooltip for specified entities (unless a custom tooltip is defined)
  if (hideTooltipEntities.has(entity.entity) && !customTooltip) {
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
      delayDuration={200}
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
            {customTooltip ?? `${entity.entity_long} (${entity.entity})`}
          </p>
          {affiliationLabel && (
            <p
              className="mt-0.5 text-left text-[11px] font-medium text-wrap uppercase"
              style={{ color: affiliationColor }}
            >
              {affiliationLabel}
            </p>
          )}
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
