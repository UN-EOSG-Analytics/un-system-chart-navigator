import { Entity } from "@/types/entity";
import EntityGrid from "./EntityGrid";

interface SubcategorySectionProps {
  subcategory: string;
  entities: Entity[];
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
}

export default function SubcategorySection({
  subcategory,
  entities,
  onEntityClick,
  customBgColor,
  customTextColor,
}: SubcategorySectionProps) {
  if (entities.length === 0) return null;

  return (
    <div className="pl-3">
      {subcategory && (
        <h3 className="subcategory-header mb-1.5 text-sm font-normal text-gray-500 sm:text-base">
          {subcategory}
        </h3>
      )}
      <EntityGrid
        entities={entities}
        onEntityClick={onEntityClick}
        customBgColor={customBgColor}
        customTextColor={customTextColor}
      />
    </div>
  );
}
