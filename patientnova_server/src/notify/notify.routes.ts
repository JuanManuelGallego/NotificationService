import { Router, type Request, type Response } from 'express';

import { apiError, handleError, ok } from '../utils/apiUtils.js';
import { sendSms, sendWhatsApp } from '../twillo/twilioClient.js';
import { sendSmsSchema, sendWhatsAppSchema, validate } from '../utils/validation.js';
import { reminderRepository } from '../reminders/reminder.repository.js';
import { Channel } from '../utils/types.js';
import { ReminderMode, ReminderStatus } from '@prisma/client';
import { prisma } from '../prisma/prismaClient.js';

export const notifyRouter = Router();

/**
 * Verify that a patientId belongs to the authenticated user.
 */
async function verifyPatientOwnership(patientId: string, userId: string): Promise<boolean> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId },
    select: { id: true },
  });
  return !!patient;
}

/**
 * POST /notify/whatsapp
 * Send an immediate WhatsApp message.
 */
notifyRouter.post(
  '/whatsapp',
  validate(sendWhatsAppSchema),
  async (req: Request, res: Response) => {
    try {
      if (req.body.patientId) {
        const isOwner = await verifyPatientOwnership(req.body.patientId, req.user!.id);
        if (!isOwner) return apiError(res, 'Patient not found', 404);
      }

      const result = await sendWhatsApp(req.body);
      reminderRepository.create({
        channel: Channel.WHATSAPP,
        contentSid: req.body.contentSid,
        contentVariables: req.body.contentVariables,
        messageId: result.messageSid,
        sendMode: ReminderMode.IMMEDIATE,
        patientId: req.body.patientId,
        sendAt: new Date(),
        status: ReminderStatus.SENT,
        to: req.body.to,
      }, req.user!.id)
      ok(res, result, 201);
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * POST /notify/sms
 * Send an immediate SMS.
 */
notifyRouter.post(
  '/sms',
  validate(sendSmsSchema),
  async (req: Request, res: Response) => {
    try {
      if (req.body.patientId) {
        const isOwner = await verifyPatientOwnership(req.body.patientId, req.user!.id);
        if (!isOwner) return apiError(res, 'Patient not found', 404);
      }

      const result = await sendSms(req.body);
      reminderRepository.create({
        channel: Channel.SMS,
        body: req.body.body,
        messageId: result.messageSid,
        sendMode: ReminderMode.IMMEDIATE,
        patientId: req.body.patientId,
        sendAt: new Date(),
        status: ReminderStatus.SENT,
        to: req.body.to,
      }, req.user!.id)

      ok(res, result, 201);
    } catch (err) {
      handleError(res, err);
    }
  }
);
