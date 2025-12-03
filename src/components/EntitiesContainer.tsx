import { Entity } from "@/types/entity";
import EntityCard from "./EntityCard";

interface EntityGridProps {
  entities: Entity[];
  onEntityClick: (entitySlug: string) => void;
  customBgColor?: string;
  customTextColor?: string;
  showReviewBorders?: boolean;
}

export default function EntityContainer({
  entities,
  onEntityClick,
  customBgColor,
  customTextColor,
  showReviewBorders = false,
}: EntityGridProps) {
  return (
    <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
      {entities.map((entity) => (
        <EntityCard
          key={entity.entity}
          entity={entity}
          onEntityClick={onEntityClick}
          customBgColor={customBgColor}
          customTextColor={customTextColor}
          showReviewBorders={showReviewBorders}
        />
      ))}
    </div>
  );
}
