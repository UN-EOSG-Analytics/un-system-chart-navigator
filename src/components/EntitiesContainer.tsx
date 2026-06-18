import {
  affiliatedEntities,
  chipDisplayNames,
  externalLinkEntities,
  principalOrganConfigs,
} from "@/lib/constants";
import {
  cn,
  createEntitySlug,
  getCssColorVar,
  normalizePrincipalOrgan,
} from "@/lib/utils";
import { Entity } from "@/types/entity";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
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

function getChipBackground(
  entity: Entity,
  customBgColor: string,
): string | undefined {
  const normalizedOrgans = normalizePrincipalOrgan(entity.un_principal_organ);
  if (!normalizedOrgans || normalizedOrgans.length <= 1) {
    // Affiliated entities (e.g. UNDP-affiliated) get a lighter shade of the
    // organ color so they read as subordinate to the parent they sort after.
    if (affiliatedEntities[entity.entity]) {
      return `color-mix(in srgb, ${getCssColorVar(customBgColor)} 55%, white)`;
    }
    return undefined;
  }
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

/**
 * Group key used to detect a parent entity and its affiliated children, which
 * the sort order guarantees are rendered contiguously. Affiliated entities map
 * to their parent's name; everything else maps to itself.
 */
function getGroupKey(entity: Entity): string {
  return affiliatedEntities[entity.entity]?.parent ?? entity.entity;
}

/** Two adjacent chips belong to the same affiliated cluster (parent + children). */
function sameCluster(a: Entity | undefined, b: Entity | undefined): boolean {
  if (!a || !b) return false;
  return (
    getGroupKey(a) === getGroupKey(b) &&
    (!!affiliatedEntities[a.entity] || !!affiliatedEntities[b.entity])
  );
}

export default function EntityContainer({
  entities,
  onEntityClick,
  customBgColor = "bg-gray-200",
  customTextColor = "text-black",
  showReviewBorders = false,
  chipRefs,
}: EntityGridProps) {
  return (
    <div className={entityChip.container}>
      {entities.map((entity, index) => {
        // A parent entity and its affiliated children render as one connected
        // segmented bar: square the touching edges, cancel the gap, and divide
        // with a hairline so they read as related rather than standalone chips.
        const joinLeft = sameCluster(entities[index - 1], entity);
        const joinRight = sameCluster(entity, entities[index + 1]);
        const rounding =
          joinLeft && joinRight
            ? "rounded-none"
            : joinLeft
              ? "rounded-l-none rounded-r-full"
              : joinRight
                ? "rounded-r-none rounded-l-full"
                : "rounded-full";

        return (
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
              className={cn(
                customBgColor,
                customTextColor,
                entityChip.base,
                rounding,
                joinLeft && "-ml-1 border-l border-black/10 sm:-ml-1.5",
                showReviewBorders &&
                  entity.review_needed &&
                  "outline-2 outline-red-600",
              )}
              aria-label={`View details for ${entity.entity_long || entity.entity}`}
              style={{ background: getChipBackground(entity, customBgColor) }}
            >
              {chipDisplayNames[entity.entity] ?? entity.entity}
              {externalLinkEntities[entity.entity] && (
                <ExternalLinkIcon className="ml-[0.2em] inline-block align-middle -translate-y-[0.1em] h-[0.75em] w-[0.75em] shrink-0" aria-hidden="true" />
              )}
            </button>
          </EntityTooltip>
        );
      })}
    </div>
  );
}
