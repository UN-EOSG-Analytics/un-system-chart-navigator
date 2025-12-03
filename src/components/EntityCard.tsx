"use client";

import {
  getEntityFootnote,
  normalizePrincipalOrgan,
  principalOrganConfigs,
} from "@/lib/constants";
import { createEntitySlug, getCssColorVar } from "@/lib/utils";
import { Entity } from "@/types/entity";
import EntityTooltip from "./EntityTooltip";

interface EntityCardProps {
  entity: Entity;
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
  showReviewBorders?: boolean;
}

const EntityCard = ({
  entity,
  onEntityClick,
  customBgColor,
  customTextColor,
  showReviewBorders = false,
}: EntityCardProps) => {
  // Check if entity has multiple principal organs
  const normalizedOrgans = normalizePrincipalOrgan(entity.un_principal_organ);
  const hasMultipleOrgans = normalizedOrgans && normalizedOrgans.length > 1;

  // Check for entity-specific footnotes
  const footnoteNumbers = getEntityFootnote(entity.entity);

  // Use custom colors if provided, otherwise use defaults
  const bgColor = customBgColor || "bg-gray-100";
  const textColor = customTextColor || "text-black";

  // Create URL-friendly slug from entity name using utility function
  const entitySlug = createEntitySlug(entity.entity);

  // All cards take exactly 1 grid cell for uniform appearance

  const handleClick = () => {
    onEntityClick(entitySlug);
  };

  const borderClass =
    showReviewBorders && entity.review_needed ? "outline-2 outline-red-600" : "";

  // Generate split background for multiple organs
  const splitBackground =
    hasMultipleOrgans && normalizedOrgans
      ? (() => {
          const colors = normalizedOrgans.map((organ) => {
            const config = principalOrganConfigs[organ];
            return config
              ? getCssColorVar(config.bgColor)
              : getCssColorVar("bg-gray-300");
          });

          if (colors.length === 2) {
            return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`;
          }
          // For more than 2 organs, distribute evenly
          const step = 100 / colors.length;
          const stops = colors
            .flatMap((color, i) => [
              `${color} ${i * step}%`,
              `${color} ${(i + 1) * step}%`,
            ])
            .join(", ");
          return `linear-gradient(135deg, ${stops})`;
        })()
      : null;

  return (
    <EntityTooltip entity={entity}>
      <button
        onClick={handleClick}
        // Spacing constraints: Equal top/bottom margins for 1-line and 2-line text
        // Math: h-[50px] - (2 lines × 15px line-height) = 20px remaining → py-[10px] each
        // Fixed line-height prevents spacing conflicts; -mt-[1px] compensates for font's internal top spacing
        // top-left aligned
        className={`${!splitBackground ? bgColor : ""} ${textColor} ${borderClass} flex h-[50px] w-full animate-in cursor-pointer touch-manipulation items-start justify-start rounded-lg px-3 py-[10px] text-left fade-in slide-in-from-bottom-4 hover:scale-105 hover:shadow-md active:scale-95 sm:h-[55px] sm:py-[12.5px]`}
        style={splitBackground ? { background: splitBackground } : undefined}
        aria-label={`View details for ${entity.entity_long}`}
      >
        <span className="-mt-[1px] text-xs leading-[15px] font-medium sm:text-sm sm:leading-[15px]">
          {entity.entity}
          {footnoteNumbers && (
            <sup className="ml-0.5 text-[9px] sm:text-[10px]">
              {footnoteNumbers.join(",")}
            </sup>
          )}
        </span>
      </button>
    </EntityTooltip>
  );
};

export default EntityCard;
