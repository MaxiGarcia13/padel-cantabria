import type { CategoryMatch } from '@padel-cantabria/database';
import type { CategoryResolveResult } from './resolve-category-value.js';
import { badRequest } from '../errors.js';
import { presentCategories } from '../presenters/present-category.js';

export function unresolvedCategoryError(
  result: Exclude<CategoryResolveResult, { status: 'matched' }>,
) {
  const candidates = presentCategories(result.candidates);

  if (result.status === 'unknown') {
    return badRequest('Unknown category; ask the user or refine the query', {
      code: 'unknown_category',
      details: { candidates },
    });
  }

  return badRequest(
    'Ambiguous category; ask the user to pick from candidates',
    {
      code: 'ambiguous_category',
      details: { candidates },
    },
  );
}

export function requireCategoryMatch(
  result: CategoryResolveResult,
): CategoryMatch {
  if (result.status === 'matched') {
    return result.match;
  }

  throw unresolvedCategoryError(result);
}
