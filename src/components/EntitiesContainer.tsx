import { externalLinkEntities, principalOrganConfigs } from "@/lib/constants";
import {
  createEntitySlug,
  getCssColorVar,
  normalizePrincipalOrgan,
} from "@/lib/utils";
import { Entity } from "@/types/entity";
import { RefObject } from "react";
import EntityTooltip from "./EntityTooltip";

interface EntityGridProps {
  entities: Entity[];
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
  showReviewBorders?: boolean;
  chipRefs?: RefObject<Map<string, HTMLButtonElement>>;
}

function getChipBackground(entity: Entity): string | undefined {
  const normalizedOrgans = normalizePrincipalOrgan(entity.un_principal_organ);
  if (!normalizedOrgans || normalizedOrgans.length <= 1) return undefined;
  const colors = normalizedOrgans.map((organ) => {
    const config = principalOrganConfigs[organ];
    return config
      ? getCssColorVar(config.bgColor)
      : getCssColorVar("bg-gray-300");
  });
  if (colors.length === 2) {
    return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`;
  }
  const step = 100 / colors.length;
  const stops = colors
    .flatMap((color, i) => [
      `${color} ${i * step}%`,
      `${color} ${(i + 1) * step}%`,
    ])
    .join(", ");
  return `linear-gradient(135deg, ${stops})`;
}

export default function EntityContainer({
  entities,
  onEntityClick,
  customBgColor = "bg-gray-200",
  customTextColor = "text-black",
  chipRefs,
}: EntityGridProps) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-1.5">
      {entities.map((entity) => (
        <EntityTooltip key={entity.entity} entity={entity}>
          <button
            ref={(el) => {
              if (el) chipRefs?.current.set(entity.entity, el);
              else chipRefs?.current.delete(entity.entity);
            }}
            type="button"
            onClick={() => {
              const externalLink = externalLinkEntities[entity.entity];
              if (externalLink) {
                window.open(externalLink, "_blank", "noopener,noreferrer");
              } else {
                onEntityClick(createEntitySlug(entity.entity));
              }
            }}
            className={`${customBgColor} ${customTextColor} tracking-0 cursor-pointer rounded-full px-3 py-1.25 text-[11px] leading-none font-medium shadow-[0_3px_8px_rgba(0,0,0,0.03)] hover:scale-[1.05] hover:shadow-[0_6px_14px_rgba(0,0,0,0.12)] hover:brightness-90 sm:px-3.5 sm:py-1.5 sm:text-xs`}
            aria-label={`View details for ${entity.entity_long || entity.entity}`}
            style={{ background: getChipBackground(entity) }}
          >
            {entity.entity}
          </button>
        </EntityTooltip>
      ))}
    </div>
  );
}
