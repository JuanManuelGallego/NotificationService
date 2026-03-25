import cron from "node-cron";
import { ReminderStatus, Channel, type Reminder, AppointmentStatus } from "@prisma/client";
import { prisma } from "../prisma/prismaClient.js";
import { logger } from "./logger.js";
import { getMessageStatus, sendSms, sendWhatsApp } from "../twillo/twilioClient.js";
import { reminderRepository } from "../reminders/reminder.repository.js";
import { appointmentRepository } from "../appointments/appointment.repository.js";

let schedulerTask: cron.ScheduledTask | null = null;

function validateReminder(reminder: Reminder): { isValid: boolean; error?: string; } {
  if (!reminder.channel) {
    return {
      isValid: false,
      error: "Missing channel for reminder",
    };
  }
  if (!reminder.to) {
    return {
      isValid: false,
      error: `No recipient available for channel ${reminder.channel}`,
    };
  }

  if (reminder.channel === Channel.WHATSAPP) {
    if (!reminder.contentSid) {
      return {
        isValid: false,
        error: "Missing contentSid for WhatsApp message",
      };
    }

    if (
      reminder.contentVariables &&
      (typeof reminder.contentVariables !== "object" ||
        reminder.contentVariables === null)
    ) {
      return { isValid: false, error: "Invalid contentVariables format" };
    }
  }

  if (reminder.channel === Channel.SMS || reminder.channel === Channel.EMAIL) {
    if (!reminder.body) {
      return {
        isValid: false,
        error: `Missing body for ${reminder.channel} message`,
      };
    }
  }

  return { isValid: true };
}

type TrackedReminder = { dbId: string; messageSid: string };

export async function reminderWorker(sentReminders: TrackedReminder[]): Promise<TrackedReminder[]> {
  let activeReminders: TrackedReminder[] = [];
  for (const sent of sentReminders) {
    try {
      const message = await getMessageStatus(sent.messageSid);
      const mappedStatus = twilioToPrismaStatus[ message.status ] ?? ReminderStatus.QUEUED;
      logger.info({ dbId: sent.dbId, messageSid: sent.messageSid, status: message.status, mappedStatus }, "Updating reminder status based on Twilio message status");

      if (mappedStatus !== ReminderStatus.QUEUED) {
        await reminderRepository.update(sent.dbId, { status: mappedStatus, error: mappedStatus === ReminderStatus.FAILED ? "Error desconocido en la entrega del mensaje" : undefined });
      } else {
        activeReminders.push(sent);
      }
    } catch (error) {
      logger.error({ sent, error }, "Failed to update reminder status");
    }
  }

  try {
    logger.info("Running reminder scheduler worker...");
    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60 * 950); // 950ms to account for processing time
    const remindersToSend = await prisma.reminder.findMany({
      where: {
        status: ReminderStatus.PENDING,
        sendAt: {
          lte: oneMinuteFromNow,
        },
      },
    });

    if (remindersToSend.length === 0) {
      logger.info("No reminders to send at this time");
      return activeReminders;
    }

    logger.info(`Found ${remindersToSend.length} reminder(s) to send`);

    for (const reminder of remindersToSend) {
      try {
        const validation = validateReminder(reminder);
        if (!validation.isValid) {
          logger.warn({ reminderId: reminder.id, channel: reminder.channel, error: validation.error, },
            `Reminder validation failed: ${validation.error}`
          );
          await reminderRepository.update(reminder.id, {
            status: ReminderStatus.FAILED,
            error: validation.error,
          });
          continue;
        }

        const contentVariables = reminder.contentVariables as Record<string, string>;

        let result;
        switch (reminder.channel) {
          case Channel.WHATSAPP:
            result = await sendWhatsApp({
              to: reminder.to!,
              contentSid: reminder.contentSid!,
              ...(contentVariables && { contentVariables }),
            });
            break;

          case Channel.SMS:
            result = await sendSms({
              to: reminder.to!,
              body: reminder.body!,
            });
            break;

          case Channel.EMAIL:
            result = {
              success: false,
              error: "EMAIL channel not yet implemented",
              messageSid: null,
            };
            break;

          default:
            result = {
              success: false,
              error: "Channel not supported",
              messageSid: null,
            };
        }

        if (result.success) {
          logger.info({ reminderId: reminder.id, messageSid: result.messageSid }, "Reminder sent successfully");
          if (result.messageSid) activeReminders.push({ dbId: reminder.id, messageSid: result.messageSid });
          await reminderRepository.update(reminder.id, {
            status: ReminderStatus.QUEUED,
            messageId: result.messageSid ?? "",
          });
        } else {
          logger.error({ reminderId: reminder.id, error: result.error }, "Failed to send reminder");
          await reminderRepository.update(reminder.id, {
            status: ReminderStatus.FAILED,
            error: result.error,
          });
        }
      } catch (error) {
        logger.error({ reminderId: reminder.id, error }, "Error processing reminder");
        await reminderRepository.update(reminder.id, {
          status: ReminderStatus.FAILED,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  } catch (error) {
    logger.error({ error }, "Error in reminder scheduler worker");
  }
  finally {
    return activeReminders;
  }
}

export async function appointmentWorker(): Promise<void> {
  logger.info("Running appointment worker...");
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  const appointmentsToComplete = await prisma.appointment.findMany({
    where: {
      status: {
        in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.SCHEDULED,
        ],
      }, startAt: {
        lte: lastHour,
      },
    },
    include: {
      patient: true,
    },
  });

  if (appointmentsToComplete.length == 0) logger.info("No appointments to complete at this time")

  for (const appointment of appointmentsToComplete) {
    try {
      appointmentRepository.update(appointment.id, { status: AppointmentStatus.COMPLETED })
      logger.info({ appointmentId: appointment.id }, "Appointment completed successfully")
    } catch (error) {
      logger.error({ appointmentId: appointment.id }, "Failed to update appointment status");
    }
  }
}

export function initializeSchedulers(): void {
  logger.info("Initializing reminder scheduler...");
  let sentReminders: TrackedReminder[] = [];
  schedulerTask = cron.schedule("* * * * *", async () => { // */5 * * * *
    sentReminders = await reminderWorker(sentReminders);
    await appointmentWorker();
  });

  logger.info("Schedulers initialized - running every minute");
}

export function stopScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask.destroy();
    schedulerTask = null;
    logger.info("Reminder scheduler stopped");
  }
}

const twilioToPrismaStatus: Partial<Record<string, ReminderStatus>> = {
  queued: ReminderStatus.QUEUED,
  sent: ReminderStatus.SENT,
  delivered: ReminderStatus.SENT,
  failed: ReminderStatus.FAILED,
  undelivered: ReminderStatus.FAILED,
};
