import { AppointmentStatus, Prisma, type Appointment } from '@prisma/client';
import { prisma } from '../prisma/prismaClient.js';
import {
  type CreateAppointmentDto,
  type UpdateAppointmentDto,
  type ListAppointmentsQuery,
  type AppointmentStatsQuery,
} from './appointment.schemas.js';
import { AppointmentPatientNotFoundError, AppointmentReminderNotFoundError, AppointmentNotFoundError } from '../utils/errors.js';
import { appointmentInclude, type AppointmentWithRelations, type PaginatedAppointments, type AppointmentStats } from '../utils/types.js';

export const appointmentRepository = {
  async create(dto: CreateAppointmentDto): Promise<AppointmentWithRelations> {
    const patient = await prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient) throw new AppointmentPatientNotFoundError(dto.patientId);

    if (dto.reminderId) {
      const reminder = await prisma.reminder.findUnique({ where: { id: dto.reminderId } });
      if (!reminder) throw new AppointmentReminderNotFoundError(dto.reminderId);
    }

    return prisma.appointment.create({
      data: {
        startAt: dto.startAt,
        endAt: dto.endAt,
        timezone: dto.timezone || 'CST',
        price: dto.price,
        currency: dto.currency || "COP",
        paid: dto.paid,
        location: dto.location,
        meetingUrl: dto.meetingUrl || null,
        notes: dto.notes || null,
        type: dto.type,
        status: dto.status,
        patientId: dto.patientId,
        ...(dto.reminderId && { reminder: { connect: { id: dto.reminderId } }, reminderId: dto.reminderId }),
      },
      include: appointmentInclude,
    });
  },

  async findById(id: string): Promise<AppointmentWithRelations> {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    });
    if (!appt) throw new AppointmentNotFoundError(id);
    return appt;
  },

  async findMany(query: ListAppointmentsQuery): Promise<PaginatedAppointments> {
    const { patientId, status, startAt, dateFrom, dateTo, paid, search, page, pageSize, orderBy, order } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AppointmentWhereInput = {
      ...(patientId && { patientId }),
      ...(status && { status }),
      ...(paid !== undefined && { paid }),
      ...(startAt && {
        startAt: {
          gte: new Date(`${startAt}T00:00:00.000Z`),
          lte: new Date(`${startAt}T23:59:59.999Z`),
        },
      }), // Only works in UTC...
      ...(search && {
        OR: [
          { location: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
          {
            patient: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } }
              ]
            }
          } ]
      }),
      ...(dateFrom || dateTo
        ? {
          startAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
        : {}),
    };

    const [ data, total ] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [ orderBy ]: order },
        include: appointmentInclude,
      }),
      prisma.appointment.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentWithRelations> {
    await appointmentRepository.findById(id);

    if (dto.reminderId) {
      const reminder = await prisma.reminder.findUnique({ where: { id: dto.reminderId } });
      if (!reminder) throw new AppointmentReminderNotFoundError(dto.reminderId);
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.startAt !== undefined && { startAt: dto.startAt }),
        ...(dto.endAt !== undefined && { endAt: dto.endAt }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.paid !== undefined && { paid: dto.paid }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.meetingUrl !== undefined && { meetingUrl: dto.meetingUrl }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.status === AppointmentStatus.CONFIRMED && { confirmedAt: new Date() }),
        ...(dto.status === AppointmentStatus.CANCELLED && { cancelledAt: new Date() }),
        ...(dto.status === AppointmentStatus.COMPLETED && { completedAt: new Date() }),
        ...(dto.reminderId !== undefined && {
          reminder: dto.reminderId
            ? { connect: { id: dto.reminderId } }
            : { disconnect: true },
        }),
      },
      include: appointmentInclude,
    });
  },

  async delete(id: string): Promise<Appointment> {
    await appointmentRepository.findById(id);
    return prisma.appointment.delete({ where: { id } });
  },

  async markPaid(id: string): Promise<AppointmentWithRelations> {
    await appointmentRepository.findById(id);
    return prisma.appointment.update({
      where: { id },
      data: { paid: true },
      include: appointmentInclude,
    });
  },

  async getStats(query: AppointmentStatsQuery): Promise<AppointmentStats> {
    const { patientId, dateFrom, dateTo } = query;
    const where: Prisma.AppointmentWhereInput = {
      ...(patientId && { patientId }),
      ...(dateFrom || dateTo
        ? {
          startAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
        : {}),
    };

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [ statusGroups, paidAgg, unpaidAgg, todayAgg ] = await prisma.$transaction([
      prisma.appointment.groupBy({
        by: [ 'status' ],
        _count: { id: true },
        orderBy: { status: 'asc' },
        where,
      }),
      prisma.appointment.aggregate({
        _sum: { price: true },
        _count: { _all: true },
        where: { ...where, paid: true },
      }),
      prisma.appointment.aggregate({
        _sum: { price: true },
        _count: { _all: true },
        where: { ...where, paid: false },
      }),
      prisma.appointment.count({
        where: { ...where, startAt: { gte: todayStart, lte: todayEnd } },
      }),
    ]);

    const byStatus: Record<string, number> = Object.fromEntries(
      Object.values(AppointmentStatus).map(s => [ s, 0 ])
    );
    for (const group of statusGroups) {
      byStatus[ group.status ] = (group._count as { id: number }).id;
    }

    const paidRevenue = paidAgg._sum.price ?? 0;
    const unpaidRevenue = unpaidAgg._sum.price ?? 0;

    return {
      total: paidAgg._count._all + unpaidAgg._count._all,
      todayCount: todayAgg,
      byStatus,
      totalRevenue: paidRevenue + unpaidRevenue,
      paidRevenue,
      unpaidRevenue,
      unpaidCount: unpaidAgg._count._all,
    };
  },
};

