import { Entity } from "@/types/entity";
import EntityContainer from "./EntitiesContainer";

interface SubcategorySectionProps {
  subcategory: string;
  entities: Entity[];
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
  showReviewBorders?: boolean;
}

/**
 * A smaller, more indented section for subcategories.
 * Use sparingly for nested groupings within a CategorySection.
 */
export default function SubcategorySection({
  subcategory,
  entities,
  onEntityClick,
  customBgColor,
  customTextColor,
  showReviewBorders = false,
}: SubcategorySectionProps) {
  if (entities.length === 0) return null;

  return (
    <div className="mt-2 pl-3">
      <h3 className="mb-1 text-xs font-normal text-gray-400 sm:text-sm">
        {subcategory.trim() || "\u00A0"}
      </h3>
      <EntityContainer
        entities={entities}
        onEntityClick={onEntityClick}
        customBgColor={customBgColor}
        customTextColor={customTextColor}
        showReviewBorders={showReviewBorders}
      />
    </div>
  );
}
