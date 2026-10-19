import { joinDisplayParts, stringField } from './join-display-parts';

export function formatCategoryLike(
  record: Record<string, unknown>,
): string | null {
  const category = stringField(record, 'category');
  if (!category) {
    return null;
  }

  const categoryValue = stringField(record, 'category_value');

  return joinDisplayParts([
    category,
    stringField(record, 'gender') || null,
    stringField(record, 'phase') || null,
    categoryValue ? `id ${categoryValue}` : null,
  ]);
}
