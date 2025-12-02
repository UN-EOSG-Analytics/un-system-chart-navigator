import {
  categoryOrderByPrincipalOrgan,
  getCategoryFootnote,
  getSortedCategories,
  principalOrganConfigs,
} from "@/lib/constants";
import { getCssColorVar, getCssColorVarDark } from "@/lib/utils";
import { Entity } from "@/types/entity";
import CategoryFootnote from "./CategoryFootnote";
import EntityGrid from "./EntityGrid";
import CategorySection from "./SectionCategory";

interface PrincipalOrganSectionProps {
  groupKey: string;
  entities: Entity[];
  onEntityClick: (entitySlug: string) => void;
}

export default function PrincipalOrganSection({
  groupKey,
  entities,
  onEntityClick,
}: PrincipalOrganSectionProps) {
  const organConfig = principalOrganConfigs[groupKey];
  const groupLabel = organConfig?.label || groupKey;
  const organBgColor = organConfig?.bgColor || "bg-gray-300";
  const organTextColor = organConfig?.textColor || "text-black";
  const sectionHeading = organConfig?.sectionHeading || null;
  const borderColor = organConfig?.borderColor
    ? getCssColorVar(organConfig.borderColor)
    : getCssColorVarDark(organBgColor);

  // Check if categories are defined for this organ
  const hasDefinedCategories =
    categoryOrderByPrincipalOrgan[groupKey] !== undefined &&
    Object.keys(categoryOrderByPrincipalOrgan[groupKey]).length > 0;

  // If only empty string category is defined, skip category layer entirely
  const skipCategoryLayer =
    hasDefinedCategories &&
    Object.keys(categoryOrderByPrincipalOrgan[groupKey]).length === 1 &&
    "" in categoryOrderByPrincipalOrgan[groupKey];

  // Group entities by category
  const categorizedEntities = entities.reduce(
    (acc: Record<string, Entity[]>, entity: Entity) => {
      // Use empty string if skipping category layer, otherwise use entity category
      const category = skipCategoryLayer ? "" : entity.category || "N/A";
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
          className="mb-6 border-l-[6px] pt-3 pl-4 sm:pt-5 sm:pl-4"
          style={{
            borderColor: borderColor,
          }}
        >
          <div className="mb-1 h-px bg-gradient-to-r from-gray-400 via-gray-200 to-transparent"></div>
          <h2 className="text-2xl font-bold text-black uppercase sm:text-2xl md:text-3xl">
            {groupLabel}
            {getCategoryFootnote(groupKey) && (
              <CategoryFootnote
                footnoteNumbers={getCategoryFootnote(groupKey)!}
              />
            )}
          </h2>
          {sectionHeading && (
            <h3 className="mt-1 text-lg font-semibold text-gray-500 leading-tight sm:text-lg md:text-xl">
              {sectionHeading}
            </h3>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {!hasDefinedCategories ? (
            <EntityGrid
              entities={entities}
              onEntityClick={onEntityClick}
              customBgColor={organBgColor}
              customTextColor={organTextColor}
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
                  skipCategoryHeader={skipCategoryLayer}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
