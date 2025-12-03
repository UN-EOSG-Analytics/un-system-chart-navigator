import {
  entitySortOrder,
  getCategoryFootnote,
  subcategorySortOrder,
} from "@/lib/constants";
import { naturalCompare } from "@/lib/utils";
import { Entity } from "@/types/entity";
import Footnote from "./Footnote";
import EntityContainer from "./EntitiesContainer";
import SubcategorySection from "./SectionSubcategory";

interface CategorySectionProps {
  category: string;
  entities: Entity[];
  groupKey: string;
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
  smallHeaders?: boolean;
  showReviewBorders?: boolean;
}

export default function CategorySection({
  category,
  entities,
  groupKey,
  onEntityClick,
  customBgColor,
  customTextColor,
  smallHeaders = false,
  showReviewBorders = false,
}: CategorySectionProps) {
  if (entities.length === 0) return null;

  // Header styling based on smallHeaders prop
  const headerClasses = smallHeaders
    ? "mb-1.5 text-sm font-normal text-gray-500 sm:text-base" // Smaller styling
    : "mb-2 text-base font-medium text-gray-500 sm:text-lg"; // Default styling

  // Group entities by subcategory
  const entitiesWithoutSubcategory = entities
    .filter((e) => !e.subcategory)
    .sort((a, b) => {
      const orderA = entitySortOrder[a.entity] ?? 0;
      const orderB = entitySortOrder[b.entity] ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return naturalCompare(a.entity, b.entity);
    });
  const entitiesBySubcategory = entities.reduce(
    (acc: Record<string, Entity[]>, entity) => {
      if (entity.subcategory) {
        if (!acc[entity.subcategory]) {
          acc[entity.subcategory] = [];
        }
        acc[entity.subcategory].push(entity);
      }
      return acc;
    },
    {},
  );
  // Sort subcategories: use custom order if defined, otherwise alphabetical
  const subcategories = Object.keys(entitiesBySubcategory).sort((a, b) => {
    const orderA = subcategorySortOrder[a] ?? 0;
    const orderB = subcategorySortOrder[b] ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return naturalCompare(a, b);
  });

  return (
    <div className="px-3">
      <h2 className={`category-header ${headerClasses}`}>
        {category.trim() || "\u00A0"}
        {getCategoryFootnote(groupKey, category) && (
          <Footnote
            footnoteNumbers={getCategoryFootnote(groupKey, category)!}
          />
        )}
      </h2>
      {/* Entities without subcategory */}
      {entitiesWithoutSubcategory.length > 0 && (
        <EntityContainer
          entities={entitiesWithoutSubcategory}
          onEntityClick={onEntityClick}
          customBgColor={customBgColor}
          customTextColor={customTextColor}
          showReviewBorders={showReviewBorders}
        />
      )}
      {/* Subcategory sections */}
      {subcategories.map((subcategory) => (
        <SubcategorySection
          key={subcategory}
          subcategory={subcategory}
          entities={entitiesBySubcategory[subcategory]}
          onEntityClick={onEntityClick}
          customBgColor={customBgColor}
          customTextColor={customTextColor}
          showReviewBorders={showReviewBorders}
        />
      ))}
    </div>
  );
}
