import { btnPrimary } from "@/src/styles/theme";
import { STATUS_CFG } from "@/src/types/Appointment";
import { Patient, PATIENT_STATUS_CONFIG } from "@/src/types/Patient";
import { REMINDER_STATUS_CONFIG } from "@/src/types/Reminder";
import { fmtDate, fmtDateTime } from "@/src/utils/TimeUtils";
import { PatientStatusPill, AppointmentStatusPill, ReminderStatusPill } from "../Info/StatusPill";
import { Section, Row } from "./DrawerUtils";

export function PatientDrawer({ patient, onClose, onEdit, onDelete }: {
    patient: Patient;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const s = PATIENT_STATUS_CONFIG[ patient.status ];

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }} onClick={onClose}>
            <div style={{ flex: 1, background: "rgba(17,24,39,0.4)", backdropFilter: "blur(3px)" }} />
            <div style={{
                width: 420, background: "#fff", height: "100%", overflowY: "auto",
                boxShadow: "-10px 0 40px rgba(0,0,0,0.15)", animation: "slideInRight 0.25s ease",
                display: "flex", flexDirection: "column",
            }} onClick={e => e.stopPropagation()}>
                <div style={{ background: s.bg, padding: "24px 24px 20px", borderBottom: `3px solid ${s.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {patient.name} {patient.lastName}
                            </h2>
                            <div style={{ marginTop: 8 }}>
                                <PatientStatusPill status={patient.status} />
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#6B7280" }}>✕</button>
                    </div>
                </div>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
                    <Section title="Información de Contacto">
                        {patient.email && <Row icon="📧" label="Correo" value={<a href={`mailto:${patient.email}`} style={{ color: "#2563EB", textDecoration: "none" }}>{patient.email}</a>} />}
                        {patient.whatsappNumber && <Row icon="💬" label="WhatsApp" value={<span style={{ fontFamily: "monospace" }}>{patient.whatsappNumber}</span>} />}
                        {patient.smsNumber && <Row icon="📱" label="SMS" value={<span style={{ fontFamily: "monospace" }}>{patient.smsNumber}</span>} />}
                        {!patient.email && !patient.whatsappNumber && !patient.smsNumber && (
                            <div style={{ fontSize: 13, color: "#9CA3AF" }}>Sin información de contacto registrada</div>
                        )}
                    </Section>
                    <Section title="Información Adicional">
                        {patient.dateOfBirth && <Row icon="📅" label="Fecha de Nacimiento" value={fmtDate(typeof patient.dateOfBirth === 'string' ? patient.dateOfBirth : patient.dateOfBirth.toISOString())} />}
                        {patient.notes && <div style={{ display: "flex", gap: 10 }}>
                            <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>📝</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Notas</div>
                                <div style={{ fontSize: 13, color: "#111827", fontWeight: 500, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{patient.notes}</div>
                            </div>
                        </div>}
                        {!patient.dateOfBirth && !patient.notes && (
                            <div style={{ fontSize: 13, color: "#9CA3AF" }}>Sin información adicional</div>
                        )}
                    </Section>
                    {patient.appointments && patient.appointments.length > 0 && (
                        <Section title="Citas Vinculadas">
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {patient.appointments.map(apt => {
                                    const aptStatus = STATUS_CFG[ apt.status ];
                                    return (
                                        <div key={apt.id} style={{ padding: "12px", background: "#F9FAFB", borderRadius: 8, borderLeft: `3px solid ${aptStatus.dot}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{apt.type}</div>
                                                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>📅 {fmtDateTime(apt.startAt.toString())}</div>
                                                </div>
                                                <AppointmentStatusPill status={apt.status} />
                                            </div>
                                            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7280" }}>
                                                <span>📍 {apt.location}</span>
                                                {apt.paid && <span>💰 Pagada</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}
                    {patient.reminders && patient.reminders.length > 0 && (
                        <Section title="Recordatorios Vinculados">
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {patient.reminders.map(rem => {
                                    const remStatus = REMINDER_STATUS_CONFIG[ rem.status ];
                                    const channelLabel = rem.channel === "WHATSAPP" ? "💬 WhatsApp" : "📱 SMS";
                                    return (
                                        <div key={rem.id} style={{ padding: "12px", background: "#F9FAFB", borderRadius: 8, borderLeft: `3px solid ${remStatus.dot}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{channelLabel}</div>
                                                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, fontFamily: "monospace" }}>Envío: {rem.sentAt ? fmtDateTime(rem.sentAt.toString()) : "Pendiente"}</div>
                                                </div>
                                                <ReminderStatusPill status={rem.status} />
                                            </div>
                                            {rem.error && (
                                                <div style={{ fontSize: 11, color: "#DC2626", background: "#FEF2F2", padding: "4px 8px", borderRadius: 4, marginTop: 4 }}>
                                                    ⚠️ {rem.error}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}
                    <Section title="Información del sistema">
                        <Row icon="🆔" label="ID" value={<span style={{ fontFamily: "monospace", fontSize: 11 }}>{patient.id}</span>} />
                        <Row icon="📆" label="Creado" value={new Date(patient.createdAt).toLocaleString("es-ES")} />
                        <Row icon="🔁" label="Actualizado" value={new Date(patient.updatedAt).toLocaleString("es-ES")} />
                        {patient.archivedAt && <Row icon="🗃️" label="Archivado" value={new Date(patient.archivedAt).toLocaleString("es-ES")} />}
                    </Section>
                </div>
                <div style={{ padding: "16px 24px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8 }}>
                    <button onClick={onEdit} style={{ ...btnPrimary, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        ✏️ Editar
                    </button>
                    <button onClick={onDelete} style={{
                        padding: "10px 16px", background: "#FEF2F2", border: "none", borderRadius: 10,
                        fontSize: 14, fontWeight: 600, color: "#DC2626", cursor: "pointer",
                    }}>
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}
