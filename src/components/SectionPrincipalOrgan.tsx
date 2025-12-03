import {
  categoryOrderByPrincipalOrgan,
  getCategoryFootnote,
  getSortedCategories,
  principalOrganConfigs,
} from "@/lib/constants";
import { getCssColorVar, getCssColorVarDark } from "@/lib/utils";
import { Entity } from "@/types/entity";
import Footnote from "./Footnote";
import EntityContainer from "./EntitiesContainer";
import CategorySection from "./SectionCategory";

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
  const borderColor = organConfig?.borderColor
    ? getCssColorVar(organConfig.borderColor)
    : getCssColorVarDark(organBgColor);

  // Check if this organ should skip the category layer entirely (from config)
  const skipCategoryLayer = organConfig?.skipCategoryLayer === true;
  const smallCategoryHeaders = organConfig?.smallCategoryHeaders === true;

  // Check if categories are defined for this organ
  const hasDefinedCategories =
    !skipCategoryLayer &&
    categoryOrderByPrincipalOrgan[groupKey] !== undefined &&
    Object.keys(categoryOrderByPrincipalOrgan[groupKey]).length > 0;

  // Group entities by category (only if not skipping category layer)
  const categorizedEntities = entities.reduce(
    (acc: Record<string, Entity[]>, entity: Entity) => {
      // Use entity category or space for fallback (blank header)
      const category = entity.category || " ";
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div
        style={{
          background: `linear-gradient(to bottom, color-mix(in srgb, ${getCssColorVar(organBgColor)} 15%, transparent), color-mix(in srgb, ${getCssColorVar(organBgColor)} 20%, transparent))`,
        }}
      >
        {/* Principal Organ Heading */}
        <div
          className="mb-5 border-l-[6px] pt-2 pl-4 sm:pt-3 pb-2 sm:pl-4"
          style={{
            borderColor: borderColor,
          }}
        >
          <h2 className="text-2xl font-bold text-black uppercase sm:text-2xl md:text-3xl">
            {groupLabel}
            {getCategoryFootnote(groupKey) && (
              <Footnote
                footnoteNumbers={getCategoryFootnote(groupKey)!}
              />
            )}
          </h2>
          {sectionHeading && (
            <h3 className="mt-1 text-lg leading-tight font-semibold text-gray-500 sm:text-lg md:text-xl">
              {sectionHeading}
            </h3>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
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
      </div>
    </div>
  );
}
