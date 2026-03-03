import { z } from 'zod';

// ==================== CONSTANTS ====================

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// ==================== SCHEMAS ====================

/**
 * Query schema for listing matches with optional pagination
 */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

/**
 * Param schema for match ID validation
 */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Schema for creating a new match
 */
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'Sport cannot be empty'),
    homeTeam: z.string().min(1, 'Home team cannot be empty'),
    awayTeam: z.string().min(1, 'Away team cannot be empty'),
    startTime: z.string(),
    endTime: z.string(),
    homeScore: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(0)
      .optional(),
    awayScore: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(0)
      .optional(),
  })
  .refine(
    (data) => {
      try {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        return !isNaN(start.getTime()) && !isNaN(end.getTime());
      } catch {
        return false;
      }
    },
    {
      message: 'startTime and endTime must be valid ISO date strings',
      path: ['startTime', 'endTime'],
    }
  )
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime must be chronologically after startTime',
        path: ['endTime'],
      });
    }
  });

/**
 * Schema for updating match scores
 */
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
