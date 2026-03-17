"use client";

import {
  categoryOverrideForOrgan,
  categoryOrderByPrincipalOrgan,
  hideCategoryForOrgan,
  placeholderEntities,
  principalOrganConfigs,
  principalOrganSlugs,
} from "@/lib/constants";
import {
  createEntitySlug,
  getCategoryFootnote,
  getCssColorVar,
  getCssColorVarDark,
  getSortedCategories,
  naturalCompareEntities,
  normalizePrincipalOrgan,
} from "@/lib/utils";
import { Entity } from "@/types/entity";
import { ChevronDown } from "lucide-react";
import { KeyboardEvent, MouseEvent, useState } from "react";
import Footnote from "./Footnote";
import EntityContainer from "./EntitiesContainer";
import CategorySection from "./SectionCategory";
import ExternalLink from "./ExternalLink";

const placeholderEntityNames = new Set(
  placeholderEntities.map((entity) => entity.entity),
);

interface PrincipalOrganSectionProps {
  groupKey: string;
  entities: Entity[];
  onEntityClick: (entitySlug: string) => void;
  showReviewBorders?: boolean;
}

export default function PrincipalOrganSection({
  groupKey,
  entities,
  onEntityClick,
  showReviewBorders = false,
}: PrincipalOrganSectionProps) {
  const organConfig = principalOrganConfigs[groupKey];
  const groupLabel = organConfig?.label || groupKey;
  const organBgColor = organConfig?.bgColor || "bg-gray-300";
  const organTextColor = organConfig?.textColor || "text-black";
  const sectionHeading = organConfig?.sectionHeading || null;
  const sectionHeadingLink = organConfig?.sectionHeadingLink || null;
  const labelLink = organConfig?.labelLink || null;
  const borderColor = organConfig?.borderColor
    ? getCssColorVar(organConfig.borderColor)
    : getCssColorVarDark(organBgColor);

  // Check if this organ should skip the category layer entirely (from config)
  const skipCategoryLayer = organConfig?.skipCategoryLayer === true;
  const smallCategoryHeaders = organConfig?.smallCategoryHeaders === true;
  const [isExpanded, setIsExpanded] = useState(
    organConfig?.defaultCollapsed !== true,
  );
  const contentId = `principal-organ-${principalOrganSlugs[groupKey] || groupKey.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  // Check if categories are defined for this organ
  const hasDefinedCategories =
    !skipCategoryLayer &&
    categoryOrderByPrincipalOrgan[groupKey] !== undefined &&
    Object.keys(categoryOrderByPrincipalOrgan[groupKey]).length > 0;

  // Group entities by category (only if not skipping category layer)
  // For dual-organ entities, check if category should be hidden for this organ
  const categorizedEntities = entities.reduce(
    (acc: Record<string, Entity[]>, entity: Entity) => {
      // Check if this entity should hide its category for this organ
      const hideKey = `${entity.entity}|${groupKey}`;
      const shouldHideCategory = hideCategoryForOrgan.has(hideKey);
      const categoryOverride = categoryOverrideForOrgan[hideKey];

      // Use space (fallback) if category should be hidden, otherwise use entity's category
      const category = shouldHideCategory
        ? " "
        : categoryOverride || entity.category || " ";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(entity);
      return acc;
    },
    {},
  );

  const sortedCategories = getSortedCategories(
    Object.keys(categorizedEntities),
    groupKey,
  );
  const collapsedPreviewEntities = entities.filter(
    (entity) => !placeholderEntityNames.has(entity.entity),
  ).sort((left, right) => naturalCompareEntities(left.entity, right.entity));

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const handleHeadingClick = () => {
    toggleExpanded();
  };

  const handleHeadingKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
    }
  };

  const stopTogglePropagation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  const getCollapsedChipBackground = (entity: Entity) => {
    const normalizedOrgans = normalizePrincipalOrgan(entity.un_principal_organ);

    if (!normalizedOrgans || normalizedOrgans.length <= 1) {
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
      .flatMap((color, index) => [
        `${color} ${index * step}%`,
        `${color} ${(index + 1) * step}%`,
      ])
      .join(", ");

    return `linear-gradient(135deg, ${stops})`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div
        style={{
          background: `linear-gradient(to bottom, color-mix(in srgb, ${getCssColorVar(organBgColor)} 15%, transparent), color-mix(in srgb, ${getCssColorVar(organBgColor)} 20%, transparent))`,
        }}
      >
        {/* Principal Organ Heading */}
        <div
          role="button"
          tabIndex={0}
          aria-controls={contentId}
          aria-expanded={isExpanded}
          onClick={handleHeadingClick}
          onKeyDown={handleHeadingKeyDown}
          className="group mb-2 flex cursor-pointer items-start justify-between gap-2.5 border-l-[6px] bg-white/10 px-3 py-2 select-none transition-[background-color,transform,box-shadow] duration-200 hover:bg-white/24 hover:shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:mb-2.5 sm:px-3.5 sm:py-2.5"
          style={{
            borderColor: borderColor,
          }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-black uppercase sm:text-[1.45rem] md:text-[1.7rem]">
              {labelLink ? (
                <ExternalLink
                  href={labelLink}
                  className="font-bold text-black hover:underline"
                  onClick={stopTogglePropagation}
                >
                  {groupLabel}
                </ExternalLink>
              ) : (
                groupLabel
              )}
              {getCategoryFootnote(groupKey) && (
                <Footnote footnoteNumbers={getCategoryFootnote(groupKey)!} />
              )}
            </h2>
            {sectionHeading && (
              <h3 className="mt-0.5 text-sm leading-tight font-semibold text-gray-500 sm:text-[15px] md:text-base">
                {sectionHeadingLink ? (
                  <ExternalLink
                    href={sectionHeadingLink}
                    className="font-semibold text-gray-500 hover:underline"
                    onClick={stopTogglePropagation}
                  >
                    {sectionHeading}
                  </ExternalLink>
                ) : (
                  sectionHeading
                )}
              </h3>
            )}
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-white/80 bg-white/80 text-gray-700 shadow-[0_6px_14px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
            <span className="sr-only">
              {isExpanded ? "Collapse section" : "Expand section"}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
              aria-hidden="true"
            />
          </div>
        </div>

        {!isExpanded && collapsedPreviewEntities.length > 0 && (
          <div className="px-3 pb-2.5 sm:px-3.5 sm:pb-3">
            <div className="flex flex-wrap gap-0.75 sm:gap-1">
              {collapsedPreviewEntities.map((entity) => (
                <button
                  key={entity.entity}
                  type="button"
                  onClick={() => onEntityClick(createEntitySlug(entity.entity))}
                  className={`${organBgColor} ${organTextColor} cursor-pointer rounded-full px-2 py-0.75 text-[9px] leading-none font-medium tracking-0 shadow-[0_3px_8px_rgba(0,0,0,0.03)] transition-transform hover:scale-[1.02] hover:shadow-[0_6px_12px_rgba(0,0,0,0.06)] sm:px-2.5 sm:text-[10px]`}
                  aria-label={`View details for ${entity.entity_long || entity.entity}`}
                  style={{
                    background: getCollapsedChipBackground(entity),
                  }}
                >
                  {entity.entity}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {isExpanded && (
          <div id={contentId} className="px-6 pb-6 sm:px-8 sm:pb-8">
            {skipCategoryLayer || !hasDefinedCategories ? (
              <EntityContainer
                entities={entities}
                onEntityClick={onEntityClick}
                customBgColor={organBgColor}
                customTextColor={organTextColor}
                showReviewBorders={showReviewBorders}
              />
            ) : (
              <div className="space-y-4">
                {sortedCategories.map((category) => (
                  <CategorySection
                    key={category}
                    category={category}
                    entities={categorizedEntities[category]}
                    groupKey={groupKey}
                    onEntityClick={onEntityClick}
                    customBgColor={organBgColor}
                    customTextColor={organTextColor}
                    smallHeaders={smallCategoryHeaders}
                    showReviewBorders={showReviewBorders}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
