import { externalLinkEntities, principalOrganConfigs } from "@/lib/constants";
import {
  createEntitySlug,
  getCssColorVar,
  normalizePrincipalOrgan,
} from "@/lib/utils";
import { Entity } from "@/types/entity";
import { RefObject } from "react";
import EntityTooltip from "./EntityTooltip";
import { entityChip } from "@/lib/styles";

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
    <div className={entityChip.container}>
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
            className={`${customBgColor} ${customTextColor} ${entityChip.base}`}
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
