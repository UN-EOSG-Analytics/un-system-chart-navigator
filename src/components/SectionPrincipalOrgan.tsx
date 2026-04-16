"use client";

import {
  categoryOverrideForOrgan,
  categoryOrderByPrincipalOrgan,
  externalLinkEntities,
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
import { Maximize2, Minimize2 } from "lucide-react";
import {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Footnote from "./Footnote";
import CategorySection from "./SectionCategory";
import ExternalLink from "./ExternalLink";
import EntityTooltip from "./EntityTooltip";
import { entityChip, organSection } from "@/lib/styles";

const placeholderEntityNames = new Set(
  placeholderEntities.map((entity) => entity.entity),
);

interface PrincipalOrganSectionProps {
  groupKey: string;
  entities: Entity[];
  onEntityClick: (entitySlug: string) => void;
  showReviewBorders?: boolean;
  forceExpanded?: boolean;
}

export default function PrincipalOrganSection({
  groupKey,
  entities,
  onEntityClick,
  showReviewBorders = false,
  forceExpanded,
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
  const noCollapse = organConfig?.noCollapse === true;
  const smallCategoryHeaders = organConfig?.smallCategoryHeaders === true;
  const headingOnly = organConfig?.headingOnly === true;
  const [isExpanded, setIsExpanded] = useState(
    organConfig?.defaultCollapsed !== true,
  );

  useEffect(() => {
    if (forceExpanded !== undefined) {
      savedPositions.current.clear();
      chipRefs.current.forEach((el, key) => {
        savedPositions.current.set(key, el.getBoundingClientRect());
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsExpanded(forceExpanded);
    }
  }, [forceExpanded]);
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
  const collapsedPreviewEntities = entities
    .filter((entity) => !placeholderEntityNames.has(entity.entity))
    .sort((left, right) => naturalCompareEntities(left.entity, right.entity));

  // FLIP animation refs
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const savedPositions = useRef<Map<string, DOMRect>>(new Map());

  const toggleExpanded = () => {
    // Snapshot current positions before state change
    savedPositions.current.clear();
    chipRefs.current.forEach((el, key) => {
      savedPositions.current.set(key, el.getBoundingClientRect());
    });
    setIsExpanded((prev) => !prev);
  };

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

  // FLIP: after render, invert & play
  useLayoutEffect(() => {
    if (savedPositions.current.size === 0) return;
    chipRefs.current.forEach((el, key) => {
      const oldRect = savedPositions.current.get(key);
      if (!oldRect) return;
      const newRect = el.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;
      if (dx === 0 && dy === 0) return;
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform 300ms ease";
        el.style.transform = "";
      });
    });
    savedPositions.current.clear();
  }, [isExpanded]);

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
    <div className={organSection.wrapper}>
      <div
        className="relative"
        style={{
          background: `linear-gradient(to bottom, color-mix(in srgb, ${getCssColorVar(organBgColor)} 15%, transparent), color-mix(in srgb, ${getCssColorVar(organBgColor)} 20%, transparent))`,
        }}
      >
        {/* Principal Organ Heading */}
        <div
          role={headingOnly || noCollapse ? undefined : "button"}
          tabIndex={headingOnly || noCollapse ? undefined : 0}
          aria-controls={headingOnly || noCollapse ? undefined : contentId}
          aria-expanded={headingOnly || noCollapse ? undefined : isExpanded}
          onClick={headingOnly || noCollapse ? undefined : handleHeadingClick}
          onKeyDown={
            headingOnly || noCollapse ? undefined : handleHeadingKeyDown
          }
          title={
            headingOnly || noCollapse
              ? undefined
              : isExpanded
                ? "Click to collapse"
                : "Click to expand"
          }
          className={`${organSection.headingRow}${headingOnly || noCollapse ? "" : "cursor-pointer"}`}
          style={{
            borderColor: borderColor,
          }}
        >
          <div className="min-w-0 flex-1">
            <h2 className={organSection.title}>
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
              <h3 className={organSection.subtitle}>
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

          {!headingOnly && !noCollapse && (
            <div className={organSection.collapseButtonWrapper}>
              <div className={organSection.collapseButton}>
                <span className="sr-only">
                  {isExpanded ? "Collapse section" : "Expand section"}
                </span>
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </div>
            </div>
          )}
        </div>

        {!headingOnly && (
          <div
            id={contentId}
            className={`${organSection.contentBorder} ${organSection.content}`}
            style={{ borderColor: borderColor }}
          >
            {skipCategoryLayer || !hasDefinedCategories ? (
              <div className={organSection.skipCategoryChipRow}>
                {collapsedPreviewEntities.map((entity) => (
                  <EntityTooltip key={entity.entity} entity={entity}>
                    <button
                      ref={(el) => {
                        if (el) chipRefs.current.set(entity.entity, el);
                        else chipRefs.current.delete(entity.entity);
                      }}
                      type="button"
                      onClick={() => {
                        const externalLink =
                          externalLinkEntities[entity.entity];
                        if (externalLink) {
                          window.open(
                            externalLink,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } else {
                          onEntityClick(createEntitySlug(entity.entity));
                        }
                      }}
                      className={`${organBgColor} ${organTextColor} ${entityChip.withBorder}`}
                      aria-label={`View details for ${entity.entity_long || entity.entity}`}
                      style={{ background: getCollapsedChipBackground(entity) }}
                    >
                      {entity.entity}
                    </button>
                  </EntityTooltip>
                ))}
              </div>
            ) : isExpanded ? (
              <div className={organSection.categorySpacing}>
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
                    chipRefs={chipRefs}
                  />
                ))}
              </div>
            ) : (
              <div className={organSection.collapsedChipRow}>
                {collapsedPreviewEntities.map((entity) => (
                  <EntityTooltip key={entity.entity} entity={entity}>
                    <button
                      ref={(el) => {
                        if (el) chipRefs.current.set(entity.entity, el);
                        else chipRefs.current.delete(entity.entity);
                      }}
                      type="button"
                      onClick={() => {
                        const externalLink =
                          externalLinkEntities[entity.entity];
                        if (externalLink) {
                          window.open(
                            externalLink,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } else {
                          onEntityClick(createEntitySlug(entity.entity));
                        }
                      }}
                      className={`${organBgColor} ${organTextColor} ${entityChip.withBorder}`}
                      aria-label={`View details for ${entity.entity_long || entity.entity}`}
                      style={{ background: getCollapsedChipBackground(entity) }}
                    >
                      {entity.entity}
                    </button>
                  </EntityTooltip>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
