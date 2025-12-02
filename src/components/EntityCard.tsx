"use client";

import { Entity } from "@/types/entity";
import { createEntitySlug } from "@/lib/utils";
import EntityTooltip from "./EntityTooltip";

interface EntityCardProps {
  entity: Entity;
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
}

const EntityCard = ({
  entity,
  onEntityClick,
  customBgColor,
  customTextColor,
}: EntityCardProps) => {
  // Use custom colors if provided, otherwise use defaults
  const bgColor = customBgColor || "bg-gray-100";
  const textColor = customTextColor || "text-black";

  // Create URL-friendly slug from entity name using utility function
  const entitySlug = createEntitySlug(entity.entity);

  // All cards take exactly 1 grid cell for uniform appearance

  const handleClick = () => {
    onEntityClick(entitySlug);
  };

  const borderClass = entity.review_needed ? "border-2 border-red-600" : "";

  return (
    <EntityTooltip entity={entity}>
      <button
        onClick={handleClick}
        className={`${bgColor} ${textColor} ${borderClass} flex h-[50px] w-full animate-in cursor-pointer touch-manipulation items-start justify-start rounded-lg pt-3 pr-2 pb-2 pl-3 text-left transition-all duration-200 ease-out fade-in slide-in-from-bottom-4 hover:scale-105 hover:shadow-md active:scale-95 sm:h-[55px]`}
        aria-label={`View details for ${entity.entity_long}`}
      >
        <span className="text-xs leading-tight font-medium sm:text-sm">
          {entity.entity}
        </span>
      </button>
    </EntityTooltip>
  );
};

export default EntityCard;
