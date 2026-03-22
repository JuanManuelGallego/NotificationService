import { Reminder, REMINDER_STATUS_CONFIG, getChannelLabel, getChannelIcon, ReminderStatus, ReminderMode } from "@/src/types/Reminder";
import { fmtDateAndTime } from "@/src/utils/TimeUtils";
import { ReminderStatusPill } from "../Info/StatusPill";
import { Section, Row } from "./DrawerUtils";

export function ReminderDrawer({ reminder, onClose, onEdit, onCancel }: {
    reminder: Reminder;
    onClose: () => void;
    onEdit: () => void;
    onCancel: () => void;
}) {
    const s = REMINDER_STATUS_CONFIG[ reminder.status ];
    const channelLabel = getChannelLabel(reminder.channel);
    const channelIcon = getChannelIcon(reminder.channel);
    const isPending = reminder.status === ReminderStatus.PENDING;

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer-backdrop" />
            <div className="drawer-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-header" style={{ background: s.bg, borderBottom: `3px solid ${s.dot}` }}>
                    <div className="drawer-header__top">
                        <div>
                            <div className="drawer-header__icon">{channelIcon}</div>
                            <h2 className="drawer-header__title">{channelLabel}</h2>
                            <div className="drawer-header__status"><ReminderStatusPill status={reminder.status} /></div>
                        </div>
                        <button onClick={onClose} className="btn-close--transparent">✕</button>
                    </div>
                </div>
                <div className="drawer-body">
                    <Section title="Destinatario">
                        <Row icon="👤" label="Nombre" value={`${reminder.patient?.name ?? "—"} ${reminder.patient?.lastName ?? "—"}`} />
                        <Row icon="📞" label="Número" value={<span className="mono">{reminder.to}</span>} />
                        <Row icon="📢" label="Modo" value={reminder.sendMode === ReminderMode.IMMEDIATE ? "Inmediato" : "Programado"} />
                    </Section>
                    <Section title="Programación">
                        <Row icon="⏰" label={isPending ? "Se envia el" : "Enviado el"} value={fmtDateAndTime(reminder.sendAt)} />
                        {reminder.sendAt && <Row icon="🗓️" label="Programado" value={fmtDateAndTime(reminder.sendAt)} />}
                    </Section>
                    <Section title="Mensaje">
                        <Row icon="✉️" label="Mensaje" value={<span className="mono">{reminder.contentSid}</span>} />
                    </Section>
                    {reminder.error && (
                        <Section title="Error">
                            <div className="error-inline">{reminder.error}</div>
                        </Section>
                    )}
                    <Section title="Información del sistema">
                        <Row icon="🆔" label="ID" value={<span className="mono-sm">{reminder.id}</span>} />
                        <Row icon="📆" label="Creado" value={fmtDateAndTime(reminder.createdAt)} />
                        <Row icon="🔁" label="Actualizado" value={fmtDateAndTime(reminder.updatedAt)} />
                        <Row icon="🆔" label="Twillo ID" value={<span className="mono">{reminder.messageId ?? '-'}</span>} />
                    </Section>
                </div>
                {isPending && <div className="drawer-footer">
                    <button onClick={onEdit} className="btn-primary btn-primary--block">✏️ Reprogramar</button>
                    <button onClick={onCancel} className="btn-drawer-delete">🗑️ Cancelar</button>
                </div>}
            </div>
        </div>
    );
}
