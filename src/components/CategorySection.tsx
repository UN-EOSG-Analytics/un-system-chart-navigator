import {
  getCategoryFootnote,
  getSortedSubcategories,
  subcategoryOrderByPrincipalOrgan,
} from "@/lib/constants";
import { Entity } from "@/types/entity";
import CategoryFootnote from "./CategoryFootnote";
import EntityGrid from "./EntityGrid";
import SubcategorySection from "./SubcategorySection";

interface CategorySectionProps {
  category: string;
  entities: Entity[];
  groupKey: string;
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
  isSecurityCouncil?: boolean;
}

export default function CategorySection({
  category,
  entities,
  groupKey,
  onEntityClick,
  customBgColor,
  customTextColor,
  isSecurityCouncil = false,
}: CategorySectionProps) {
  // Group entities by subcategory
  const subcategorizedEntities = entities.reduce(
    (acc: Record<string, Entity[]>, entity: Entity) => {
      const subcategory = entity.subcategory || "";
      if (!acc[subcategory]) {
        acc[subcategory] = [];
      }
      acc[subcategory].push(entity);
      return acc;
    },
    {},
  );

  // Check if subcategories are defined
  const hasDefinedSubcategories =
    subcategoryOrderByPrincipalOrgan[groupKey] !== undefined;

  // If no subcategories defined, show entities directly
  if (!hasDefinedSubcategories) {
    return (
      <div>
        <h2 className="category-header mb-2 text-base font-medium text-gray-600 sm:text-lg">
          {category}
          {getCategoryFootnote(groupKey, category) && (
            <CategoryFootnote
              footnoteNumbers={getCategoryFootnote(groupKey, category)!}
            />
          )}
        </h2>
        <EntityGrid
          entities={entities}
          onEntityClick={onEntityClick}
          customBgColor={customBgColor}
          customTextColor={customTextColor}
        />
      </div>
    );
  }

  // Get all defined subcategories
  const definedSubcategories = Object.keys(
    subcategoryOrderByPrincipalOrgan[groupKey] || {},
  ).filter((key) => key !== "");

  const allSubcategories = Array.from(new Set([...definedSubcategories]));
  const sortedSubcategories = getSortedSubcategories(
    allSubcategories,
    groupKey,
  );

  // Security Council: skip category header
  if (isSecurityCouncil) {
    return (
      <div className="space-y-3">
        {sortedSubcategories.map((subcategory) => (
          <SubcategorySection
            key={subcategory || "none"}
            subcategory={subcategory}
            entities={subcategorizedEntities[subcategory] || []}
            onEntityClick={onEntityClick}
            customBgColor={customBgColor}
            customTextColor={customTextColor}
          />
        ))}
      </div>
    );
  }

  // Other organs: show category header then subcategories
  return (
    <div>
      <h2 className="category-header mb-2 text-base font-medium text-gray-600 sm:text-lg">
        {category}
        {getCategoryFootnote(groupKey, category) && (
          <CategoryFootnote
            footnoteNumbers={getCategoryFootnote(groupKey, category)!}
          />
        )}
      </h2>
      <div className="space-y-3">
        {sortedSubcategories.map((subcategory) => (
          <SubcategorySection
            key={subcategory || "none"}
            subcategory={subcategory}
            entities={subcategorizedEntities[subcategory] || []}
            onEntityClick={onEntityClick}
            customBgColor={customBgColor}
            customTextColor={customTextColor}
          />
        ))}
      </div>
    </div>
  );
}
