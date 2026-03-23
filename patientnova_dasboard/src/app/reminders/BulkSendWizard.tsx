import { useCreateReminder } from "@/src/api/useCreateReminder";
import { useNotify } from "@/src/api/useNotify";
import { DateTimePicker } from "@/src/components/DateTimePicker";
import { ChannelBadge } from "@/src/components/Info/ChannelIcon";
import { Patient } from "@/src/types/Patient";
import { ReminderMode, BulkRemindersResult, CHANNEL_ICON, CHANNEL_LABEL, Channel, StepChannelProps, StepMessageProps, StepPatientsProps, StepResultsProps } from "@/src/types/Reminder";
import { getAvatarColor, getInitials } from "@/src/utils/AvatarHelper";
import { useState, useMemo, useCallback, memo } from "react";


export function BulkSendWizard({ patients }: { patients: Patient[] }) {
    const { notify } = useNotify();
    const { createReminder } = useCreateReminder();

    const [ step, setStep ] = useState(1);
    const [ channel, setChannel ] = useState<Channel>(Channel.WHATSAPP);
    const [ message, setMessage ] = useState("");
    const [ sendMode, setMode ] = useState<ReminderMode>(ReminderMode.IMMEDIATE);
    const [ sendAt, setSendAt ] = useState("");
    const [ selected, setSelected ] = useState<Set<string>>(new Set());
    const [ sending, setSending ] = useState(false);
    const [ results, setResults ] = useState<BulkRemindersResult[]>([]);
    const [ done, setDone ] = useState(false);

    const eligible = useMemo(() => patients.filter(p =>
        p.status === "ACTIVE" &&
        (channel === Channel.WHATSAPP ? !!p.whatsappNumber : channel === Channel.SMS ? !!p.smsNumber : !!p.email)
    ), [ patients, channel ]);

    const toggleAll = useCallback(() => {
        setSelected(prev => {
            if (prev.size === eligible.length) return new Set();
            return new Set(eligible.map(p => p.id));
        });
    }, [ eligible ]);

    const toggleOne = useCallback((id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const handleSend = useCallback(async () => {
        setSending(true);
        const patientMap = new Map(eligible.map(p => [ p.id, p ]));
        const tasks = Array.from(selected).map(async (pid): Promise<BulkRemindersResult> => {
            const p = patientMap.get(pid);
            if (!p) return { patientId: pid, name: pid, channel, status: "skipped", reason: "Paciente no encontrado" };

            const fullName = `${p.name} ${p.lastName}`;
            const to = channel === Channel.WHATSAPP ? p.whatsappNumber : channel === Channel.SMS ? p.smsNumber : p.email;
            if (!to) return { patientId: pid, name: fullName, channel, status: "skipped", reason: "Sin número" };

            try {
                if (sendMode === ReminderMode.IMMEDIATE) {
                    await notify(channel, {
                        to,
                        patientId: pid,
                        contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e",
                        contentVariables: {
                            "1": "12/1",
                            "2": "3pm"
                        },
                    });
                } else {
                    await createReminder({
                        patientId: pid,
                        contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e",
                        contentVariables: {
                            "1": "12/1",
                            "2": "3pm"
                        },
                        sendMode,
                        channel,
                        to,
                        sendAt
                    });
                }
                return { patientId: pid, name: fullName, channel, status: "ok", reason: "" };
            } catch (e) {
                return { patientId: pid, name: fullName, channel, status: "error", reason: String(e) };
            }
        });
        const res = await Promise.all(tasks);
        setResults(res); setSending(false); setDone(true); setStep(4);
    }, [ eligible, selected, channel, sendMode, sendAt, notify, createReminder ]);

    const reset = useCallback(() => { setStep(1); setSelected(new Set()); setMessage(""); setResults([]); setDone(false); }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <WizardStepper step={step} />
            {step === 1 && (
                <StepChannel
                    patients={patients}
                    channel={channel}
                    setChannel={setChannel}
                    setSelected={setSelected}
                    sendMode={sendMode}
                    setMode={setMode}
                    sentAt={sendAt}
                    setSentAt={setSendAt}
                    onNext={() => setStep(2)}
                />
            )}
            {step === 2 && (
                <StepPatients
                    eligible={eligible}
                    channel={channel}
                    selected={selected}
                    toggleAll={toggleAll}
                    toggleOne={toggleOne}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                />
            )}
            {step === 3 && (
                <StepMessage
                    message={message}
                    setMessage={setMessage}
                    recipientCount={selected.size}
                    sendMode={sendMode}
                    sending={sending}
                    onBack={() => setStep(2)}
                    onSend={handleSend}
                />
            )}
            {step === 4 && done && (
                <StepResults results={results} onReset={reset} />
            )}
        </div>
    );
}

const StepChannel = memo(function StepChannel({ patients, channel, setChannel, setSelected, sendMode, setMode, sentAt, setSentAt, onNext }: StepChannelProps) {
    const channelCounts = useMemo(() => {
        const counts: Record<Channel, number> = { [ Channel.WHATSAPP ]: 0, [ Channel.SMS ]: 0, [ Channel.EMAIL ]: 0 };
        for (const p of patients) {
            if (p.status !== "ACTIVE") continue;
            if (p.whatsappNumber) counts[ Channel.WHATSAPP ]++;
            if (p.smsNumber) counts[ Channel.SMS ]++;
            if (p.email) counts[ Channel.EMAIL ]++;
        }
        return counts;
    }, [ patients ]);

    return (
        <div className="table-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
                <div className="wizard-section-title">Canal de notificación</div>
                <div className="form-grid-2">
                    {Object.values(Channel).map(c => (
                        <button key={c} onClick={() => { setChannel(c); setSelected(new Set()); }}
                            className={`selection-card${channel === c ? " selection-card--active" : ""}`}
                            style={{ padding: "16px 20px" }}
                        >
                            <span style={{ fontSize: 28 }}>{CHANNEL_ICON[ c ]}</span>
                            <div>
                                <div className="patient-preview__name">{CHANNEL_LABEL[ c ]}</div>
                                <div className="patient-preview__detail">
                                    {channelCounts[ c ]} pacientes disponibles
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
                    <DateTimePicker date={sentAt} onChanged={setSentAt} showTime isFuture />
                </label>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={onNext} disabled={sendMode === ReminderMode.SCHEDULED && !sentAt} className="btn-primary">
                    Continuar →
                </button>
            </div>
        </div>
    );
});

const StepPatients = memo(function StepPatients({ eligible, channel, selected, toggleAll, toggleOne, onBack, onNext }: StepPatientsProps) {
    return (
        <div className="table-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div className="wizard-section-title" style={{ marginBottom: 2 }}>Seleccionar pacientes</div>
                    <div className="patient-preview__detail">{selected.size} de {eligible.length} seleccionados</div>
                </div>
                <button onClick={toggleAll} className="btn-secondary" style={{ padding: "7px 16px", fontSize: 13 }}>
                    {selected.size > 0 && selected.size === eligible.length ? "Deseleccionar todos" : "Seleccionar todos"}
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
                            <div className="patient-preview__name">{p.name} {p.lastName}</div>
                            <div className="patient-preview__detail">
                                {channel === Channel.WHATSAPP ? p.whatsappNumber : channel === Channel.SMS ? p.smsNumber : p.email}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={onBack} className="btn-secondary">Atrás</button>
                <button onClick={onNext} disabled={selected.size === 0} className="btn-primary">
                    Continuar → ({selected.size})
                </button>
            </div>
        </div>
    );
});

const StepMessage = memo(function StepMessage({ message, setMessage, recipientCount, sendMode, sending, onBack, onSend }: StepMessageProps) {
    return (
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
                    <span>{recipientCount} destinatarios</span>
                </div>
            </label>
            <div>
                <div className="channel-section-label">Plantillas rápidas</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                        "Le recordamos su próxima cita médica. Por favor confirme su asistencia respondiendo este mensaje.",
                        "Su cita está confirmada para mañana. Recuerde traer su tarjeta de seguro y llegar 10 minutos antes.",
                        "Importante: No olvide su cita de mañana. Si necesita cancelar, contáctenos con 24 horas de anticipación.",
                    ].map((tmpl) => (
                        <button key={tmpl} onClick={() => setMessage(tmpl)} className="template-btn">
                            {tmpl}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={onBack} className="btn-secondary">Atrás</button>
                <button onClick={onSend} disabled={!message.trim() || sending} className="btn-primary btn-hero">
                    {sending ? (
                        <>
                            <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--c-white)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                            Enviando…
                        </>
                    ) : `${sendMode === ReminderMode.IMMEDIATE ? "⚡ Enviar" : "🗓️ Programar"} a ${recipientCount} pacientes`}
                </button>
            </div>
        </div>
    );
});

const StepResults = memo(function StepResults({ results, onReset }: StepResultsProps) {
    const stats = useMemo(() => {
        let ok = 0, error = 0, skipped = 0;
        for (const r of results) {
            if (r.status === "ok") ok++;
            else if (r.status === "error") error++;
            else skipped++;
        }
        return { ok, error, skipped };
    }, [ results ]);

    return (
        <div className="table-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[
                    { label: "Enviados", value: stats.ok, color: "var(--c-success)", bg: "var(--c-success-bg)" },
                    { label: "Fallidos", value: stats.error, color: "var(--c-error)", bg: "var(--c-error-bg)" },
                    { label: "Omitidos", value: stats.skipped, color: "var(--c-warning)", bg: "var(--c-warning-bg)" },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ background: bg, borderRadius: "var(--r-xl)", padding: "16px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                        <div style={{ fontSize: 12, color, fontWeight: 500 }}>{label}</div>
                    </div>
                ))}
            </div>
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
                        {results.map((r) => (
                            <tr key={r.patientId} style={{ borderBottom: "1px solid var(--c-gray-100)" }}>
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
                <button onClick={onReset} className="btn-primary">Nuevo envío masivo</button>
            </div>
        </div>
    );
});

const WizardStepper = memo(function WizardStepper({ step }: { step: number }) {
    return (
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
    );
});
