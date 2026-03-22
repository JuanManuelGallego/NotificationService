import { Appointment, STATUS_CFG } from "@/src/types/Appointment";
import { CHANNEL_LABEL, REMINDER_STATUS_CONFIG } from "@/src/types/Reminder";
import { getAvatarColor, getInitials } from "@/src/utils/AvatarHelper";
import { fmtDate, fmtTime, getDuration } from "@/src/utils/TimeUtils";
import { PayBadge } from "../Info/PayBadge";
import { AppointmentStatusPill } from "../Info/StatusPill";
import { Section, Row } from "./DrawerUtils";

export function AppointmentDrawer({ appt, onClose, onEdit, onPay, onDelete }: {
    appt: Appointment;
    onClose: () => void;
    onEdit: () => void;
    onPay: () => void;
    onDelete: () => void;
}) {
    const s = STATUS_CFG[ appt.status ];
    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer-backdrop" />
            <div className="drawer-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-header" style={{ background: s.bg, borderBottom: `3px solid ${s.dot}` }}>
                    <div className="drawer-header__top">
                        <div>
                            <div className="drawer-header__icon">{s.icon}</div>
                            <h2 className="drawer-header__title">{appt.type}</h2>
                            <div className="drawer-header__status"><AppointmentStatusPill status={appt.status} /></div>
                        </div>
                        <button onClick={onClose} className="btn-close--transparent">✕</button>
                    </div>
                </div>
                <div className="drawer-body">
                    <Section title="Paciente">
                        <div className="td-identity">
                            <div className="avatar avatar--lg" style={{ background: getAvatarColor(appt.patient.id) }}>
                                {getInitials(appt.patient.name, appt.patient.lastName)}
                            </div>
                            <div>
                                <div className="drawer-patient__name">{appt.patient.name} {appt.patient.lastName}</div>
                                <div className="text-muted">{appt.patient.email}</div>
                            </div>
                        </div>
                    </Section>
                    <Section title="Fecha y Hora">
                        <Row icon="📅" label="Fecha" value={fmtDate(appt.startAt)} />
                        <Row icon="🕐" label="Hora" value={fmtTime(appt.startAt)} />
                        <Row icon="⏱️" label="Duración" value={getDuration(appt.startAt, appt.endAt)} />
                    </Section>
                    <Section title="Lugar">
                        <Row icon="📍" label="Ubicación" value={appt.location} />
                        {appt.meetingUrl && (
                            <div className="detail-row">
                                <span className="detail-row__icon">🔗</span>
                                <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer" className="meeting-link">Unirse a la videollamada</a>
                            </div>
                        )}
                    </Section>
                    <Section title="Pago">
                        <Row icon="💰" label="Precio" value={`$${appt.price}`} />
                        <div className="row-between">
                            <Row icon="💳" label="Estado" value={<PayBadge paid={appt.paid} />} />
                            {!appt.paid && (
                                <button onClick={onPay} className="btn-primary btn-primary--success">
                                    Marcar pagado
                                </button>
                            )}
                        </div>
                    </Section>
                    <Section title="Notas">
                        <Row icon="📝" label="Notas" value={`${appt.notes || "Ninguna Nota"}`} />
                    </Section>
                    {appt.reminder && (
                        <Section title="Recordatorio Vinculado">
                            <Row icon={appt.reminder.channel === "WHATSAPP" ? "💬" : "📱"} label="Canal" value={CHANNEL_LABEL[ appt.reminder.channel ]} />
                            <Row icon="📤" label="Estado" value={REMINDER_STATUS_CONFIG[ appt.reminder.status ].label} />
                            <Row icon="🗓️" label="Envío" value={new Date(appt.reminder.sendAt).toLocaleString("es-ES")} />
                        </Section>
                    )}
                    <Section title="Información del sistema">
                        <Row icon="🆔" label="ID" value={<span className="mono-sm">{appt.id}</span>} />
                        <Row icon="📆" label="Creada" value={new Date(appt.createdAt).toLocaleString("es-ES")} />
                    </Section>
                </div>
                <div className="drawer-footer">
                    <button onClick={onEdit} className="btn-primary btn-primary--block">✏️ Editar</button>
                    <button onClick={onDelete} className="btn-drawer-delete">🗑️</button>
                </div>
            </div>
        </div>
    );
}
