import { Prisma, ReminderStatus, type Reminder, type Channel } from '@prisma/client';
import { prisma } from '../prisma/prismaClient.js';
import type { CreateReminderDto, UpdateReminderDto, ListRemindersQuery } from './reminder.schemas.js';
import { ReminderNotFoundError, ReminderNotCancellableError } from '../utils/errors.js';
import type { PaginatedReminders } from '../utils/types.js';

export const reminderRepository = {
  async create(dto: CreateReminderDto): Promise<Reminder> {
    return prisma.reminder.create({
      data: {
        channel: dto.channel,
        contentSid: dto.contentSid || null,
        ...(dto.contentVariables && { contentVariables: dto.contentVariables }),
        messageId: dto.messageId || null,
        sendMode: dto.sendMode,
        patientId: dto.patientId,
        appointmentId: dto.appointmentId || null,
        sendAt: new Date(dto.sendAt),
        status: dto.status,
        to: dto.to,
      },
    });
  },

  async findById(id: string): Promise<Reminder> {
    const reminder = await prisma.reminder.findUnique({
      where: { id },
      include: { appointment: true },
    });
    if (!reminder) throw new ReminderNotFoundError(id);
    return reminder;
  },

  async findMany(query: ListRemindersQuery): Promise<PaginatedReminders> {
    const { status, channel, patientId, dateTo, dateFrom, page, pageSize, orderBy, order } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ReminderWhereInput = {
      ...(status && { status }),
      ...(channel && { channel: channel }),
      ...(patientId && { patientId: patientId }),
      ...(dateFrom || dateTo
        ? {
          sendAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        } : {})
    };

    const [ data, total ] = await prisma.$transaction([
      prisma.reminder.findMany({ where, skip, take: pageSize, orderBy: { [ orderBy ]: order } }),
      prisma.reminder.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async update(id: string, dto: UpdateReminderDto): Promise<Reminder> {
    await reminderRepository.findById(id); // throws if not found
    return prisma.reminder.update({
      where: { id },
      data: {
        ...(dto.channel !== undefined && { channel: dto.channel }),
        ...(dto.contentSid !== undefined && { contentSid: dto.contentSid }),
        ...(dto.contentVariables !== undefined && { contentVariables: dto.contentVariables }),
        ...(dto.error !== undefined && { error: dto.error }),
        ...(dto.messageId !== undefined && { messageId: dto.messageId }),
        ...(dto.sendMode !== undefined && { sendMode: dto.sendMode }),
        ...(dto.sendAt !== undefined && { sendAt: dto.sendAt}),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.status === ReminderStatus.SENT && { sentAt: new Date() })
      },
    });
  },

  async cancel(id: string): Promise<Reminder> {
    const reminder = await reminderRepository.findById(id);
    if (reminder.status !== 'PENDING') {
      throw new ReminderNotCancellableError(reminder.status);
    }
    return prisma.reminder.update({ where: { id }, data: { status: 'CANCELLED' } });
  },

  async delete(id: string): Promise<Reminder> {
    await reminderRepository.findById(id);
    return prisma.reminder.delete({ where: { id } });
  },
};
