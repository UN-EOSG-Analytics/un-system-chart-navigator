import { getCategoryFootnote } from "@/lib/constants";
import { Entity } from "@/types/entity";
import CategoryFootnote from "./CategoryFootnote";
import EntityGrid from "./EntitiesContainer";

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

  return (
    <div className="pl-3">
      <h2 className={`category-header ${headerClasses}`}>
        {category.trim() || "\u00A0"}
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
        showReviewBorders={showReviewBorders}
      />
    </div>
  );
}
