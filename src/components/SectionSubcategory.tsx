import { affiliatedEntities, sortLastEntities } from "@/lib/constants";
import { getOrdinalOrder, naturalCompare } from "@/lib/utils";
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
 * Get sort key for entities, handling affiliated entities that should follow their parent.
 * Returns a tuple: [parentName, isAffiliated (0 or 1), entityName]
 * This ensures affiliated entities sort right after their parent.
 */
function getAffiliatedSortKey(entity: string): [string, number, string] {
  const affiliation = affiliatedEntities[entity];
  if (affiliation) {
    // Affiliated entities: sort after parent, then alphabetically among themselves
    return [affiliation.parent, 1, entity];
  }
  // Non-affiliated: use entity name as parent, mark as non-affiliated
  return [entity, 0, entity];
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

  // Sort entities: special cases first, then apply subcategory-specific sorting
  let sortedEntities = [...entities];

  // Always sort "sortLastEntities" to the end
  sortedEntities.sort((a, b) => {
    const aLast = sortLastEntities.has(a.entity) ? 1 : 0;
    const bLast = sortLastEntities.has(b.entity) ? 1 : 0;
    return aLast - bLast;
  });

  // Sort entities by ordinal for "Main Committees" (First, Second, ... Sixth)
  if (subcategory === "Main Committees") {
    sortedEntities = sortedEntities.sort(
      (a, b) => getOrdinalOrder(a.entity) - getOrdinalOrder(b.entity),
    );
  } else {
    // Apply affiliated entity sorting (UNDP-affiliated entities after UNDP)
    sortedEntities = sortedEntities.sort((a, b) => {
      const [parentA, isAffiliatedA, nameA] = getAffiliatedSortKey(a.entity);
      const [parentB, isAffiliatedB, nameB] = getAffiliatedSortKey(b.entity);

      // First compare by parent entity name
      const parentCompare = naturalCompare(parentA, parentB);
      if (parentCompare !== 0) return parentCompare;

      // Same parent: non-affiliated (the parent itself) comes first
      if (isAffiliatedA !== isAffiliatedB) return isAffiliatedA - isAffiliatedB;

      // Both affiliated or both non-affiliated: sort alphabetically
      return naturalCompare(nameA, nameB);
    });
  }

  return (
    <div className="mt-2 pl-3">
      <h3 className="mb-1 text-xs font-normal text-gray-400 sm:text-sm">
        {subcategory.trim() || "\u00A0"}
      </h3>
      <EntityContainer
        entities={sortedEntities}
        onEntityClick={onEntityClick}
        customBgColor={customBgColor}
        customTextColor={customTextColor}
        showReviewBorders={showReviewBorders}
      />
    </div>
  );
}
