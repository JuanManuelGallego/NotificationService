import { ReminderType } from "../types/Reminder";

function fmtDateTime(iso: string | undefined): string {
    if (!iso) return "Invalid Date"
    return new Date(iso).toLocaleString("es-ES", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function fmtDateAndTime(d: string): string {
    if (!d) return "Invalid Date"
    const date = new Date(d);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toLocaleString("es-ES", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function fmtDate(d: string | undefined): string {
    if (!d) return "Invalid Date"
    return new Date(d).toLocaleDateString("es-ES", {
        day: "numeric", month: "long", year: "numeric",
    });
}

function fmtDateWeekDay(d: string | undefined): string {
    if (!d) return "Invalid Date"
    return new Date(d).toLocaleDateString("es-ES", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
}


function isoToLocal(iso: string): string {
    const date = new Date(iso);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function fmtRelative(d: string | undefined): string {
    if (!d) return "Invalid Date"
    const diff = new Date(d).getTime() - Date.now();
    const abs = Math.abs(diff);
    if (abs < 60_000) return "Ahora mismo";
    if (abs < 3_600_000) return `${Math.round(abs / 60_000)} min`;
    if (abs < 86_400_000) return `${Math.round(abs / 3_600_000)} h`;
    return `${Math.round(abs / 86_400_000)} días`;
}

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

const MONTH_NAMES_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAY_NAMES_ES = [ "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom" ];


function isReminderTypeFeasible(date: string, reminderType: ReminderType): boolean {
    if (reminderType === ReminderType.NONE) return true;
    if (!date) return false;

    const now = new Date();
    const timeUntilAppointment = new Date(date).getTime() - now.getTime();

    const reminderOffsets: Record<ReminderType, number> = {
        [ ReminderType.ONE_HOUR_BEFORE ]: 60 * 60 * 1000,
        [ ReminderType.ONE_DAY_BEFORE ]: 24 * 60 * 60 * 1000,
        [ ReminderType.ONE_WEEK_BEFORE ]: 7 * 24 * 60 * 60 * 1000,
        [ ReminderType.NONE ]: 0,
    };

    const requiredTime = reminderOffsets[ reminderType ];
    return timeUntilAppointment > requiredTime;
}


function getRemindersendAt(date: string, reminderType: ReminderType): string {
    switch (reminderType) {
        case ReminderType.ONE_HOUR_BEFORE:
            return new Date(new Date(date).getTime() - 60 * 60 * 1000).toISOString();
        case ReminderType.ONE_DAY_BEFORE:
            return new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000).toISOString();
        case ReminderType.ONE_WEEK_BEFORE:
            return new Date(new Date(date).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        default:
            return date;
    }
}

function formatDate(d: string): string {
    return new Date(d).toISOString().slice(0, 10);
}

function formatTime(d: string): string {
    return new Date(d).toISOString().slice(11, 16);
}

function getDuration(startAt: string | undefined, endAt: string | undefined): string | null {
    if (!startAt || !endAt) return null;

    const diff = (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000;
    if (diff < 60) return `${diff} min`;
    return `${Math.round(diff / 60)} h`;
}

export {
    fmtDate,
    fmtDateAndTime,
    fmtDateTime,
    fmtDateWeekDay,
    fmtRelative,
    formatDate,
    formatTime,
    getDuration,
    getRemindersendAt,
    isoToLocal,
    isReminderTypeFeasible,
    today,
    MONTH_NAMES_ES,
    DAY_NAMES_ES,
};
