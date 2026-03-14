import { Router, type Request, type Response } from 'express';
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
  uuidParamSchema,
} from './patient.schemas.js';
import {
  patientRepository,
  PatientNotFoundError,
  PatientEmailConflictError,
} from './patient.repository.js';
import { logger } from '../logger.js';
import type { ApiResponse } from '../types.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.js';

export const patientRouter = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok<T>(res: Response, data: T, status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(status).json(body);
}

function handleError(res: Response, err: unknown) {
  if (err instanceof PatientNotFoundError) {
    const body: ApiResponse = { success: false, error: err.message, timestamp: new Date().toISOString() };
    return res.status(404).json(body);
  }
  if (err instanceof PatientEmailConflictError) {
    const body: ApiResponse = { success: false, error: err.message, timestamp: new Date().toISOString() };
    return res.status(409).json(body);
  }
  logger.error({ err }, 'Unexpected patient error');
  const body: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
    timestamp: new Date().toISOString(),
  };
  return res.status(500).json(body);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /patients
 * List all patients with optional filtering and pagination.
 *
 * Query params:
 *   status    — ACTIVE | INACTIVE | ARCHIVED
 *   search    — searches name, lastName, email (case-insensitive)
 *   page      — page number (default: 1)
 *   pageSize  — results per page (default: 20, max: 100)
 *   orderBy   — name | lastName | email | createdAt (default: createdAt)
 *   order     — asc | desc (default: desc)
 *
 * Response: { data: Patient[], total, page, pageSize, totalPages }
 */
patientRouter.get(
  '/',
  validateQuery(listPatientsSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await patientRepository.findMany(req.query as any);
      ok(res, result);
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * GET /patients/:id
 * Get a single patient by UUID.
 */
patientRouter.get(
  '/:id',
  validateParams(uuidParamSchema),
  async (req: Request, res: Response) => {
    try {
      const patient = await patientRepository.findById(req.params.id as string);
      ok(res, patient);
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * POST /patients
 * Create a new patient.
 *
 * Body:
 *   {
 *     "name":           "María",
 *     "lastName":       "García",
 *     "email":          "maria.garcia@example.com",
 *     "whatsappNumber": "+15551234567",   // optional, E.164
 *     "smsNumber":      "+15551234567",   // optional, E.164
 *     "status":         "ACTIVE"          // optional, default: ACTIVE
 *   }
 */
patientRouter.post(
  '/',
  validateBody(createPatientSchema),
  async (req: Request, res: Response) => {
    try {
      const patient = await patientRepository.create(req.body);
      logger.info({ patientId: patient.id }, 'Patient created');
      ok(res, patient, 201);
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * PATCH /patients/:id
 * Partially update a patient — only send the fields you want to change.
 *
 * Body (all fields optional):
 *   {
 *     "name":           "Juan",
 *     "status":         "INACTIVE"
 *   }
 */
patientRouter.patch(
  '/:id',
  validateParams(uuidParamSchema),
  validateBody(updatePatientSchema),
  async (req: Request, res: Response) => {
    try {
      const patient = await patientRepository.update(req.params.id as string, req.body);
      logger.info({ patientId: patient.id }, 'Patient updated');
      ok(res, patient);
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * DELETE /patients/:id
 * Permanently delete a patient record.
 * Consider using PATCH /patients/:id { status: "ARCHIVED" } for soft deletes.
 */
patientRouter.delete(
  '/:id',
  validateParams(uuidParamSchema),
  async (req: Request, res: Response) => {
    try {
      const patient = await patientRepository.delete(req.params.id as string);
      logger.info({ patientId: patient.id }, 'Patient deleted');
      ok(res, { deleted: true, id: patient.id });
    } catch (err) {
      handleError(res, err);
    }
  }
);
