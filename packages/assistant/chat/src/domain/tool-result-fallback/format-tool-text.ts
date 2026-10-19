import { parseToolJson } from '@/utils/parse-tool-json';
import {
  formatCategoryClarification,
  formatUnknownCategoryMessage,
  parseCategoryToolError,
} from '../clarification';
import { formatToolValue } from './format-tool-value';

export function formatToolText(toolText: string): string {
  const categoryError = parseCategoryToolError(toolText);
  if (categoryError) {
    if (
      categoryError.code === 'unknown_category'
      && categoryError.candidates.length === 0
    ) {
      return formatUnknownCategoryMessage();
    }
    return formatCategoryClarification(categoryError.candidates);
  }

  const parsed = parseToolJson(toolText);
  if (parsed === null) {
    return toolText.trim();
  }

  return formatToolValue(parsed);
}
