import { Router, type Request, type Response } from 'express';

import { handleError, ok } from '../utils/apiUtils.js';
import { scheduleWhatsApp, sendSms, sendWhatsApp } from '../twillo/twilioClient.js';
import { scheduleSchema, sendSmsSchema, sendWhatsAppSchema, validate } from '../utils/validation.js';
import { reminderRepository } from '../reminders/reminder.repository.js';
import { Channel } from '../utils/types.js';
import { ReminderMode, ReminderStatus } from '@prisma/client';

export const notifyRouter = Router();

/**
 * POST /notify/whatsapp
 * Send an immediate WhatsApp message.
 */
notifyRouter.post(
  '/whatsapp',
  validate(sendWhatsAppSchema),
  async (req: Request, res: Response) => {
    try {
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
      })
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
      const result = await sendSms(req.body);
      ok(res, result, 201);
    } catch (err) {
      handleError(res, err);
    }
  }
);
