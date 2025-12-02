import {
  categoryOrderByPrincipalOrgan,
  getCategoryFootnote,
  getSortedCategories,
  principalOrganConfigs,
} from "@/lib/constants";
import { getCssColorVar, getCssColorVarDark } from "@/lib/utils";
import { Entity } from "@/types/entity";
import CategoryFootnote from "./CategoryFootnote";
import CategorySection from "./SectionCategory";
import EntityGrid from "./EntityGrid";

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

  // Check if categories are defined for this organ
  const hasDefinedCategories =
    categoryOrderByPrincipalOrgan[groupKey] !== undefined &&
    Object.keys(categoryOrderByPrincipalOrgan[groupKey]).length > 0;

  // Group entities by category
  const categorizedEntities = entities.reduce(
    (acc: Record<string, Entity[]>, entity: Entity) => {
      const category = entity.category || "N/A";
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

  const isSecurityCouncil = groupKey === "Security Council (SC)";

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
            borderColor: getCssColorVarDark(organBgColor),
          }}
        >
          <div className="mb-1 h-px bg-gradient-to-r from-gray-400 via-gray-200 to-transparent"></div>
          <h2 className="text-xl font-semibold text-foreground uppercase sm:text-2xl">
            {groupLabel}
            {getCategoryFootnote(groupKey) && (
              <CategoryFootnote
                footnoteNumbers={getCategoryFootnote(groupKey)!}
              />
            )}
          </h2>
          {sectionHeading && (
            <h3 className="mt-3 text-lg font-semibold text-gray-700 sm:text-xl">
              {sectionHeading}
            </h3>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {entities.length === 0 ? null : (
            <>
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
                      isSecurityCouncil={isSecurityCouncil}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
