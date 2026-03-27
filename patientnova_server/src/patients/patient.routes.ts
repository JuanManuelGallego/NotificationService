import { Router, type Request, type Response } from 'express';
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
  uuidParamSchema,
  type ListPatientsQuery,
} from './patient.schemas.js';
import {
  patientRepository,
} from './patient.repository.js';
import { logger } from '../utils/logger.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.js';
import { handleError, ok } from '../utils/apiUtils.js';

export const patientRouter = Router();

/**
 * GET /patients
 * List all patients with optional filtering and pagination.
 * Response: { data: Patient[], total, page, pageSize, totalPages }
 */
patientRouter.get<{}, any, any, ListPatientsQuery>(
  '/',
  validateQuery(listPatientsSchema),
  async (req: Request<{}, any, any, ListPatientsQuery>, res: Response) => {
    try {
      const result = await patientRepository.findMany(req.query, req.user!.id);
      ok(res, result);
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * GET /patients/stats
 * Get total patient count and a breakdown by status.
 * Response: { total: number, byStatus: Record<PatientStatus, number> }
 */
patientRouter.get(
  '/stats',
  async (req: Request, res: Response) => {
    try {
      const stats = await patientRepository.getStats(req.user!.id);
      ok(res, stats);
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
      const patient = await patientRepository.findById(req.params.id as string, req.user!.id);
      ok(res, patient);
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * POST /patients
 * Create a new patient.
 */
patientRouter.post(
  '/',
  validateBody(createPatientSchema),
  async (req: Request, res: Response) => {
    try {
      const patient = await patientRepository.create(req.body, req.user!.id);
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
 */
patientRouter.patch(
  '/:id',
  validateParams(uuidParamSchema),
  validateBody(updatePatientSchema),
  async (req: Request, res: Response) => {
    try {
      const patient = await patientRepository.update(req.params.id as string, req.body, req.user!.id);
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
      const patient = await patientRepository.delete(req.params.id as string, req.user!.id);
      logger.info({ patientId: patient.id }, 'Patient deleted');
      ok(res, { deleted: true, id: patient.id });
    } catch (err) {
      handleError(res, err);
    }
  }
);
