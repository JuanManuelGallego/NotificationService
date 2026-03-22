import { DateTimePicker } from "../DateTimePicker";
import { API_BASE } from "@/src/types/API";
import { Patient } from "@/src/types/Patient";
import { ReminderMode, BulkRemindersResult, CHANNEL_ICON, CHANNEL_LABEL, Channel } from "@/src/types/Reminder";
import { getAvatarColor, getInitials } from "@/src/utils/AvatarHelper";
import { useState } from "react";
import { ChannelBadge } from "../Info/ChannelIcon";

export function BulkSendWizard({ patients }: { patients: Patient[] }) {
    const [ step, setStep ] = useState(1);
    const [ channel, setChannel ] = useState<Channel>(Channel.WHATSAPP);
    const [ message, setMessage ] = useState("");
    const [ sendMode, setMode ] = useState<ReminderMode>(ReminderMode.IMMEDIATE);
    const [ sentAt, setsentAt ] = useState("");
    const [ selected, setSelected ] = useState<Set<string>>(new Set());
    const [ sending, setSending ] = useState(false);
    const [ results, setResults ] = useState<BulkRemindersResult[]>([]);
    const [ done, setDone ] = useState(false);

    const eligible = patients.filter(p =>
        p.status === "ACTIVE" &&
        (channel === Channel.WHATSAPP ? !!p.whatsappNumber : !!p.smsNumber)
    );

    const toggleAll = () => {
        if (selected.size === eligible.length) setSelected(new Set());
        else setSelected(new Set(eligible.map(p => p.id)));
    };

    const toggleOne = (id: string) => {
        const next = new Set(selected);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    async function handleSend() {
        setSending(true);
        const res: BulkRemindersResult[] = [];
        for (const pid of selected) {
            const p = patients.find(x => x.id === pid)!;
            const to = channel === Channel.WHATSAPP ? p.whatsappNumber : p.smsNumber;
            if (!to) { res.push({ patientId: pid, name: `${p.name}`, channel, status: "skipped", reason: "Sin número" }); continue; }
            try {
                const url = sendMode === ReminderMode.IMMEDIATE ? `${API_BASE}/notify/${channel}` : `${API_BASE}/notify/schedule`;
                const body = sendMode === ReminderMode.IMMEDIATE
                    ? { to, body: message }
                    : { channel, payload: { to, body: message }, sentAt: new Date(sentAt).toISOString() };
                const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const json = await r.json();
                res.push({ patientId: pid, name: `${p.name}`, channel, status: json.success ? "ok" : "error", reason: json.error });
            } catch (e) {
                res.push({ patientId: pid, name: `${p.name}`, channel, status: "error", reason: String(e) });
            }
        }
        setResults(res);
        setSending(false);
        setDone(true);
        setStep(4);
    }

    function reset() { setStep(1); setSelected(new Set()); setMessage(""); setResults([]); setDone(false); }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {[ "Canal", "Pacientes", "Mensaje", "Resultado" ].map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 70 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: step > i + 1 ? "var(--c-brand)" : step === i + 1 ? "var(--c-brand-accent)" : "var(--c-gray-200)",
                                color: step >= i + 1 ? "var(--c-white)" : "var(--c-gray-400)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 700,
                            }}>
                                {step > i + 1 ? "✓" : i + 1}
                            </div>
                            <span style={{ fontSize: 11, color: step === i + 1 ? "var(--c-brand)" : "var(--c-gray-400)", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                        </div>
                        {i < 3 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? "var(--c-brand)" : "var(--c-gray-200)", marginBottom: 18, transition: "background 0.3s" }} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="table-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <div className="wizard-section-title">Canal de notificación</div>
                        <div className="form-grid-2">
                            {Object.values(Channel).map(c => (
                                <button key={c} onClick={() => setChannel(c)}
                                    className={`selection-card${channel === c ? " selection-card--active" : ""}`}
                                    style={{ padding: "16px 20px" }}
                                >
                                    <span style={{ fontSize: 28 }}>{CHANNEL_ICON[ c ]}</span>
                                    <div>
                                        <div className="patient-preview__name">{CHANNEL_LABEL[ c ]}</div>
                                        <div className="patient-preview__detail">
                                            {patients.filter(p => p.status === "ACTIVE" && (c === Channel.WHATSAPP ? !!p.whatsappNumber : !!p.smsNumber)).length} pacientes disponibles
                                        </div>
                                    </div>
                                    {channel === c && <span style={{ marginLeft: "auto", color: "var(--c-brand)", fontSize: 18 }}>&#10003;</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="wizard-section-title">Tipo de envío</div>
                        <div className="form-grid-2">
                            {([
                                { k: ReminderMode.IMMEDIATE, icon: "⚡", title: "Enviar ahora", sub: "Envío inmediato a todos" },
                                { k: ReminderMode.SCHEDULED, icon: "🗓️", title: "Programar envío", sub: "Elegir fecha y hora" },
                            ] as const).map(opt => (
                                <button key={opt.k} onClick={() => setMode(opt.k)}
                                    className={`selection-card selection-card--column${sendMode === opt.k ? " selection-card--active" : ""}`}
                                    style={{ padding: "14px 18px" }}
                                >
                                    <span style={{ fontSize: 22 }}>{opt.icon}</span>
                                    <span className="patient-preview__name">{opt.title}</span>
                                    <span className="patient-preview__detail">{opt.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {sendMode === ReminderMode.SCHEDULED && (
                        <label className="form-label">
                            Fecha y hora de envío
                            <DateTimePicker date={sentAt} onChanged={setsentAt} showTime isFuture />
                        </label>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => setStep(2)} className="btn-primary">Continuar →</button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="table-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div className="wizard-section-title" style={{ marginBottom: 2 }}>Seleccionar pacientes</div>
                            <div className="patient-preview__detail">{selected.size} de {eligible.length} seleccionados</div>
                        </div>
                        <button onClick={toggleAll} className="btn-secondary" style={{ padding: "7px 16px", fontSize: 13 }}>
                            {selected.size === eligible.length ? "Deseleccionar todos" : "Seleccionar todos"}
                        </button>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                        {eligible.length === 0 && (
                            <div style={{ textAlign: "center", padding: 32, color: "var(--c-gray-400)", fontSize: 14 }}>
                                Ningún paciente activo tiene número de {CHANNEL_LABEL[ channel ]}.
                            </div>
                        )}
                        {eligible.map(p => (
                            <div key={p.id} onClick={() => toggleOne(p.id)}
                                className={`patient-select-item${selected.has(p.id) ? " patient-select-item--selected" : ""}`}
                            >
                                <div className={`checkbox-box${selected.has(p.id) ? " checkbox-box--checked" : ""}`}>
                                    {selected.has(p.id) && "✓"}
                                </div>
                                <div className="avatar avatar--sm" style={{ background: getAvatarColor(p.id) }}>
                                    {getInitials(p.name, p.lastName)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="patient-preview__name">{p.name}</div>
                                    <div className="patient-preview__detail">{channel === Channel.WHATSAPP ? p.whatsappNumber : p.smsNumber}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button onClick={() => setStep(1)} className="btn-secondary">Atrás</button>
                        <button onClick={() => setStep(3)} disabled={selected.size === 0} className="btn-primary">
                            Continuar → ({selected.size})
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="table-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="wizard-section-title">Redactar mensaje</div>
                    <label className="form-label">
                        Mensaje
                        <textarea
                            className="form-input form-input--textarea"
                            style={{ minHeight: 120 }}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Estimado/a paciente, le recordamos su cita médica próxima. Por favor confirme su asistencia respondiendo a este mensaje."
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }} className="form-input-hint">
                            <span>{message.length} / 1600 caracteres</span>
                            <span>{selected.size} destinatarios</span>
                        </div>
                    </label>
                    {/* Quick templates */}
                    <div>
                        <div className="channel-section-label">Plantillas rápidas</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                "Le recordamos su próxima cita médica. Por favor confirme su asistencia respondiendo este mensaje.",
                                "Su cita está confirmada para mañana. Recuerde traer su tarjeta de seguro y llegar 10 minutos antes.",
                                "Importante: No olvide su cita de mañana. Si necesita cancelar, contáctenos con 24 horas de anticipación.",
                            ].map((tmpl, i) => (
                                <button key={i} onClick={() => setMessage(tmpl)} className="template-btn">
                                    {tmpl}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button onClick={() => setStep(2)} className="btn-secondary">Atrás</button>
                        <button onClick={handleSend} disabled={!message.trim() || sending} className="btn-primary btn-hero">
                            {sending ? (
                                <>
                                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--c-white)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                                    Enviando {results.length}/{selected.size}…
                                </>
                            ) : `${sendMode === ReminderMode.IMMEDIATE ? "⚡ Enviar" : "🗓️ Programar"} a ${selected.size} pacientes`}
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && done && (
                <div className="table-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                        {[
                            { label: "Enviados", value: results.filter(r => r.status === "ok").length, color: "var(--c-success)", bg: "var(--c-success-bg)" },
                            { label: "Fallidos", value: results.filter(r => r.status === "error").length, color: "var(--c-error)", bg: "var(--c-error-bg)" },
                            { label: "Omitidos", value: results.filter(r => r.status === "skipped").length, color: "var(--c-warning)", bg: "var(--c-warning-bg)" },
                        ].map(({ label, value, color, bg }) => (
                            <div key={label} style={{ background: bg, borderRadius: "var(--r-xl)", padding: "16px 20px", textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                                <div style={{ fontSize: 12, color, fontWeight: 500 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                    {/* Detail table */}
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                        <table className="table-full">
                            <thead>
                                <tr style={{ background: "var(--c-gray-50)" }}>
                                    {[ "Paciente", "Canal", "Resultado", "Detalle" ].map(h => (
                                        <th key={h} className="th" style={{ fontSize: 11 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--c-gray-100)" }}>
                                        <td className="td"><span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-gray-900)" }}>{r.name}</span></td>
                                        <td className="td"><ChannelBadge channel={r.channel} /></td>
                                        <td className="td">
                                            <span className="pill" style={{
                                                background: r.status === "ok" ? "var(--c-success-bg)" : r.status === "error" ? "var(--c-error-bg)" : "var(--c-warning-bg)",
                                                color: r.status === "ok" ? "var(--c-success)" : r.status === "error" ? "var(--c-error)" : "var(--c-warning)",
                                            }}>
                                                {r.status === "ok" ? "✓ Enviado" : r.status === "error" ? "✗ Error" : "— Omitido"}
                                            </span>
                                        </td>
                                        <td className="td td--subtle">{r.reason ?? "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={reset} className="btn-primary">Nuevo envío masivo</button>
                    </div>
                </div>
            )}
        </div>
    );
}
