import { z } from 'zod';

// ─── Reusable field definitions ───────────────────────────────────────────────

const e164OrEmpty = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Must be E.164 format (e.g. +15551234567)')
  .optional()
  .or(z.literal(''));

const patientStatus = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPatientSchema = z.object({
  name:            z.string().min(1, 'name is required').max(100),
  lastName:        z.string().min(1, 'lastName is required').max(100),
  whatsappNumber:  e164OrEmpty,
  smsNumber:       e164OrEmpty,
  email:           z.string().email('Must be a valid email address'),
  status:          patientStatus.default('ACTIVE'),
});

// ─── Update (all fields optional — partial patch) ─────────────────────────────

export const updatePatientSchema = z.object({
  name:            z.string().min(1).max(100).optional(),
  lastName:        z.string().min(1).max(100).optional(),
  whatsappNumber:  e164OrEmpty,
  smsNumber:       e164OrEmpty,
  email:           z.string().email('Must be a valid email address').optional(),
  status:          patientStatus.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// ─── Query / list filters ─────────────────────────────────────────────────────

export const listPatientsSchema = z.object({
  status:   patientStatus.optional(),
  search:   z.string().max(100).optional(),    // searches name, lastName, email
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  orderBy:  z.enum(['name', 'lastName', 'email', 'createdAt']).default('createdAt'),
  order:    z.enum(['asc', 'desc']).default('desc'),
});

// ─── UUID param ───────────────────────────────────────────────────────────────

export const uuidParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreatePatientDto  = z.infer<typeof createPatientSchema>;
export type UpdatePatientDto  = z.infer<typeof updatePatientSchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsSchema>;
