import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types.js';

// ─── Generic validation factory ───────────────────────────────────────────────

type Target = 'body' | 'query' | 'params';

function makeValidator<T>(schema: z.ZodType<T>, target: Target) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map(
        (e) => `${e.path.join('.') || target}: ${e.message}`
      );
      const body: ApiResponse = {
        success: false,
        error: errors.join('; '),
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(body);
      return;
    }

    // Write coerced/defaulted values back onto the request
    (req as any)[target] = result.data;
    next();
  };
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

export const validateBody       = <T>(schema: z.ZodType<T>) => makeValidator(schema, 'body');
export const validateQuery  = <T>(schema: z.ZodType<T>) => makeValidator(schema, 'query');
export const validateParams = <T>(schema: z.ZodType<T>) => makeValidator(schema, 'params');
