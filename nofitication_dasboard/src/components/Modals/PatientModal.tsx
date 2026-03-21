import { useCreatePatient } from "@/src/api/useCreatePatient";
import { useUpdatePatient } from "@/src/api/useUpdatePatient";
import { labelStyle, inputStyle, btnSecondary, btnPrimary, btnDisabled } from "@/src/styles/theme";
import { Patient, PatientStatus, PATIENT_STATUS_CONFIG } from "@/src/types/Patient";
import { validateEmail, validatePhoneNumber } from "@/src/utils/DataValidator";
import { useState } from "react";
import { RequiredField } from "../Info/Requiered";
import { DateTimePicker } from "../DateTimePicker";

export function PatientModal({
    onClose,
    onSaved,
    patient,
}: {
    onClose: () => void;
    onSaved: () => void;
    patient?: Patient;
}) {
    const isEdit = !!patient;
    const { createPatient } = useCreatePatient();
    const { updatePatient } = useUpdatePatient();
    const [ saving, setSaving ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ form, setForm ] = useState({
        name: patient?.name ?? "",
        lastName: patient?.lastName ?? "",
        email: patient?.email,
        whatsappNumber: patient?.whatsappNumber,
        smsNumber: patient?.smsNumber,
        dateOfBirth: patient?.dateOfBirth,
        notes: patient?.notes,
        status: patient?.status ?? "ACTIVE" as PatientStatus,
    });
    const isValid = !!form.name && !!form.lastName;

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [ field ]: e.target.value }));

    function validateForm() {
        if (!form.name || !form.lastName) {
            setError("Por favor, completa todos los campos requeridos.");
            return false;
        }
        if (form.email && !validateEmail(form.email)) {
            setError("Por favor, ingresa un correo electrónico válido.");
            return false;
        }
        if (form.whatsappNumber && !validatePhoneNumber(form.whatsappNumber)) {
            setError("Por favor, ingresa un número de WhatsApp válido (formato E.164).");
            return false;
        }
        if (form.smsNumber && !validatePhoneNumber(form.smsNumber)) {
            setError("Por favor, ingresa un número de SMS válido (formato E.164).");
            return false;
        }
        setError(null);
        return true;
    }

    async function handleSubmit() {
        if (!validateForm()) return;
        setSaving(true);
        setError(null);
        try {

            if (isEdit) {
                await updatePatient(patient!.id, form);
            } else {
                await createPatient(form);
            }
            onSaved(); onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(17,24,39,0.55)", backdropFilter: "blur(4px)",
            zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={onClose}>
            <div style={{
                background: "#fff", borderRadius: 20, padding: 36,
                width: 560, maxWidth: "calc(100vw - 40px)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {isEdit ? "Editar Paciente" : "Nuevo Paciente"}
                        </h2>
                        <p style={{ fontSize: 13, color: "#9CA3AF", margin: "4px 0 0" }}>
                            {isEdit ? `Modificando: ${patient!.name} ${patient!.lastName}` : "Registrar un nuevo paciente en el sistema"}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#6B7280" }}>✕</button>
                </div>
                {error && (
                    <div style={{
                        background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10,
                        padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#DC2626",
                    }}>
                        ⚠️ {error}
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <label style={labelStyle}>
                            <RequiredField label="Nombre" />
                            <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="ej. María" />
                        </label>
                        <label style={labelStyle}>
                            <RequiredField label="Apellido" />
                            <input autoComplete="family-name"
                                style={inputStyle} value={form.lastName} onChange={set("lastName")} placeholder="ej. García" />
                        </label>
                    </div>

                    <label style={labelStyle}>
                        📅 Fecha de Nacimiento
                        <DateTimePicker
                            date={form.dateOfBirth || undefined}
                            onChanged={(date) => setForm(f => ({ ...f, dateOfBirth: date }))}
                        />
                    </label>

                    <label style={labelStyle}>
                        ✉️ Correo electrónico
                        <input style={inputStyle} type="email" value={form.email || undefined} onChange={set("email")} placeholder="paciente@ejemplo.com" />
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <label style={labelStyle}>
                            💬 WhatsApp
                            <input style={inputStyle} value={form.whatsappNumber || undefined} onChange={set("whatsappNumber")} placeholder="+15551234567" />
                        </label>
                        <label style={labelStyle}>
                            📱 SMS
                            <input style={inputStyle} value={form.smsNumber || undefined} onChange={set("smsNumber")} placeholder="+15551234567" />
                        </label>
                    </div>
                    <label style={labelStyle}>
                        📝 Notas
                        <textarea style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical", minHeight: "80px" }} value={form.notes || undefined} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas adicionales sobre el paciente..." />
                    </label>

                    {isEdit && <label style={labelStyle}>
                        Estado
                        <select style={inputStyle} value={form.status} onChange={set("status")}>
                            {Object.values(PatientStatus).map(s => (
                                <option key={s} value={s}>
                                    {PATIENT_STATUS_CONFIG[ s ].icon} {PATIENT_STATUS_CONFIG[ s ].label}
                                </option>
                            ))}
                        </select>
                    </label>}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
                    <button onClick={onClose} style={btnSecondary} disabled={saving}>Cancelar</button>
                    <button onClick={handleSubmit} disabled={saving || !isValid} style={{
                        ...isValid ? btnPrimary : btnDisabled,
                        opacity: saving || !isValid ? 0.7 : 1,
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        {saving ? "Guardando…" : isEdit ? "Guardar Cambios" : "Crear Paciente"}
                    </button>
                </div>
            </div>
        </div>
    );
}
