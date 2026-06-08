import type { Category } from "@/generated/prisma/client";
import { categoryBadgeClass, categoryLabel } from "@/lib/constants";

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${categoryBadgeClass(category)}`}
    >
      {categoryLabel(category)}
    </span>
  );
}
