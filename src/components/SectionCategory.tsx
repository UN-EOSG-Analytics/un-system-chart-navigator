import {
  affiliatedEntities,
  categoryOverrideForOrgan,
  entitySortOrder,
  hideCategoryForOrgan,
  showEmptyCategoryGap,
  subcategoryOverrideForOrgan,
  subcategorySortOrder,
} from "@/lib/constants";
import { getCategoryFootnote, naturalCompare } from "@/lib/utils";
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
  chipRefs?: Map<string, HTMLButtonElement>;
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
  chipRefs,
}: CategorySectionProps) {
  if (entities.length === 0) return null;

  // Determine if this is an empty/blank category
  const isEmptyCategory = !category.trim();

  // Check if any entity in this category should force showing the empty category gap
  const hasEntityRequiringGap = entities.some((e) =>
    showEmptyCategoryGap.has(e.entity),
  );

  // Only show the category header if:
  // 1. There's an actual category name, OR
  // 2. At least one entity is configured to show the empty category gap
  const showCategoryHeader = !isEmptyCategory || hasEntityRequiringGap;

  // Header styling based on smallHeaders prop
  const headerClasses = smallHeaders
    ? "mb-1 text-xs font-normal text-gray-500 sm:text-sm" // Smaller styling
    : "mb-1.5 text-sm font-medium text-gray-500 sm:text-base"; // Default styling

  /**
   * Get sort key for entities, handling affiliated entities that should follow their parent.
   * Returns a tuple: [parentName, isAffiliated (0 or 1), entityName]
   */
  function getAffiliatedSortKey(entity: string): [string, number, string] {
    const affiliation = affiliatedEntities[entity];
    if (affiliation) {
      return [affiliation.parent, 1, entity];
    }
    return [entity, 0, entity];
  }

  // Group entities by subcategory
  // For dual-organ entities, check if subcategory should be hidden for this organ
  const entitiesWithoutSubcategory = entities
    .filter((e) => {
      // Check if this entity should hide its category/subcategory for this organ
      const hideKey = `${e.entity}|${groupKey}`;
      const shouldHideSubcategory = hideCategoryForOrgan.has(hideKey);
      const subcategoryOverride = subcategoryOverrideForOrgan[hideKey];
      const effectiveSubcategory =
        subcategoryOverride !== undefined ? subcategoryOverride : e.subcategory;

      return !effectiveSubcategory || shouldHideSubcategory;
    })
    .sort((a, b) => {
      // First check custom entity sort order
      const orderA = entitySortOrder[a.entity] ?? 0;
      const orderB = entitySortOrder[b.entity] ?? 0;
      if (orderA !== orderB) return orderA - orderB;

      // Then apply affiliated entity sorting
      const [parentA, isAffiliatedA, nameA] = getAffiliatedSortKey(a.entity);
      const [parentB, isAffiliatedB, nameB] = getAffiliatedSortKey(b.entity);

      const parentCompare = naturalCompare(parentA, parentB);
      if (parentCompare !== 0) return parentCompare;

      if (isAffiliatedA !== isAffiliatedB) return isAffiliatedA - isAffiliatedB;

      return naturalCompare(nameA, nameB);
    });
  const entitiesBySubcategory = entities.reduce(
    (acc: Record<string, Entity[]>, entity) => {
      // Check if this entity should hide its category/subcategory for this organ
      const hideKey = `${entity.entity}|${groupKey}`;
      const shouldHideSubcategory = hideCategoryForOrgan.has(hideKey);
      const categoryOverride = categoryOverrideForOrgan[hideKey];
      const subcategoryOverride = subcategoryOverrideForOrgan[hideKey];
      const effectiveCategory = categoryOverride || entity.category || " ";
      const effectiveSubcategory =
        subcategoryOverride !== undefined
          ? subcategoryOverride
          : entity.subcategory;

      if (
        effectiveCategory === category &&
        effectiveSubcategory &&
        !shouldHideSubcategory
      ) {
        if (!acc[effectiveSubcategory]) {
          acc[effectiveSubcategory] = [];
        }
        acc[effectiveSubcategory].push(entity);
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
    <div className="px-2">
      {showCategoryHeader && (
        <h2 className={`category-header ${headerClasses}`}>
          {category.trim() || "\u00A0"}
          {getCategoryFootnote(groupKey, category) && (
            <Footnote
              footnoteNumbers={getCategoryFootnote(groupKey, category)!}
            />
          )}
        </h2>
      )}
      {/* Entities without subcategory */}
      {entitiesWithoutSubcategory.length > 0 && (
        <EntityContainer
          entities={entitiesWithoutSubcategory}
          onEntityClick={onEntityClick}
          customBgColor={customBgColor}
          customTextColor={customTextColor}
          showReviewBorders={showReviewBorders}
          chipRefs={chipRefs}
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
          chipRefs={chipRefs}
        />
      ))}
    </div>
  );
}
