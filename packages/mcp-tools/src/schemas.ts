import { z } from 'zod';

export const GENDER_OPTIONAL = z
  .string()
  .optional()
  .describe(
    'Include only when the user explicitly said masculine or feminine. Allowed values: M or F. Leave unset otherwise.',
  );

export const GENDER_REQUIRED = z
  .enum(['M', 'F'])
  .describe('M or F (ask user if unknown)');

export const CATEGORY_ARG = z
  .string()
  .describe(
    'Argument name is category. Free-text category phrase from the user, or category_value id from search_categories.',
  );

export const PHASE_OPTIONAL = z
  .string()
  .optional()
  .describe(
    'Argument name is phase. Pass the phase_value id from search_phases; defaults to the category phase.',
  );

export const TEAM_ID = z
  .number()
  .int()
  .positive()
  .describe('Team id from search_teams');

export const LIMIT_OPTIONAL = z.number().int().positive().optional();
