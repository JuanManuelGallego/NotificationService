"use client";

import { useState, useRef } from "react";
import PageLayout from "@/src/components/PageLayout";
import { PageHeader } from "@/src/components/PageHeader";
import { SuccessBanner } from "@/src/components/Info/SuccessBanner";
import { useAuthContext } from "@/src/app/AuthContext";
import { fetchWithAuth } from "@/src/api/fetchWithAuth";
import { API_BASE, ApiResponse } from "@/src/types/API";
import { User } from "@/src/types/User";

type Tab = "profile" | "security";

/** Resize an image File to a JPEG base64 data-URL at most maxSide×maxSide px. */
async function resizeToBase64(file: File, maxSide = 256): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (ev) => {
            const img = new window.Image();
            img.onerror = reject;
            img.onload = () => {
                const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            img.src = ev.target!.result as string;
        };
        reader.readAsDataURL(file);
    });
}

// ── Sub-components ────────────────────────────────────────────────────────────

const COMMON_TIMEZONES: { value: string; label: string }[] = [
    { value: "America/Bogota", label: "Colombia (UTC-5) — Bogotá" },
    { value: "America/Lima", label: "Perú (UTC-5) — Lima" },
    { value: "America/Guayaquil", label: "Ecuador (UTC-5) — Quito" },
    { value: "America/Caracas", label: "Venezuela (UTC-4) — Caracas" },
    { value: "America/La_Paz", label: "Bolivia (UTC-4) — La Paz" },
    { value: "America/Santiago", label: "Chile (UTC-4/-3) — Santiago" },
    { value: "America/Sao_Paulo", label: "Brasil (UTC-3) — São Paulo" },
    { value: "America/Argentina/Buenos_Aires", label: "Argentina (UTC-3) — Buenos Aires" },
    { value: "America/Mexico_City", label: "México (UTC-6/-5) — Ciudad de México" },
    { value: "America/New_York", label: "Eastern Time (UTC-5/-4) — Nueva York" },
    { value: "America/Chicago", label: "Central Time (UTC-6/-5) — Chicago" },
    { value: "America/Denver", label: "Mountain Time (UTC-7/-6) — Denver" },
    { value: "America/Los_Angeles", label: "Pacific Time (UTC-8/-7) — Los Ángeles" },
    { value: "Europe/Madrid", label: "España (UTC+1/+2) — Madrid" },
    { value: "Europe/London", label: "Reino Unido (UTC+0/+1) — Londres" },
    { value: "UTC", label: "UTC (UTC+0)" },
];

// ── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab({ user, updateUser }: { user: User; updateUser: (u: User) => void }) {
    const [ firstName, setFirstName ] = useState(user.firstName ?? "");
    const [ lastName, setLastName ] = useState(user.lastName ?? "");
    const [ displayName, setDisplayName ] = useState(user.displayName ?? "");
    const [ jobTitle, setJobTitle ] = useState(user.jobTitle ?? "");
    const [ timezone, setTimezone ] = useState(user.timezone ?? "America/Bogota");
    const [ avatarPreview, setAvatarPreview ] = useState<string | null>(user.avatarUrl ?? null);
    const [ saving, setSaving ] = useState(false);
    const [ success, setSuccess ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const initials = `${user.firstName?.[ 0 ] ?? ""}${user.lastName?.[ 0 ] ?? ""}`.toUpperCase() || "?";

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[ 0 ];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError("La imagen debe ser menor a 5 MB"); return; }
        if (!file.type.startsWith("image/")) { setError("Selecciona un archivo de imagen"); return; }
        try {
            setAvatarPreview(await resizeToBase64(file, 256));
            setError(null);
        } catch {
            setError("No se pudo procesar la imagen");
        }
        e.target.value = "";
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError(null);
        try {
            const res = await fetchWithAuth(`${API_BASE}/auth/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: firstName.trim() || undefined,
                    lastName: lastName.trim() || undefined,
                    displayName: displayName.trim() || undefined,
                    jobTitle: jobTitle.trim() || undefined,
                    avatarUrl: avatarPreview,
                    timezone,
                }),
            });
            const json: ApiResponse = await res.json();
            if (!res.ok || !json.success) throw new Error((json as any).message ?? "Error al guardar");
            updateUser(json.data as User);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "272px 1fr", gap: 24, maxWidth: 880 }}>
            {/* Avatar card */}
            <div className="dash-card" style={{ height: "fit-content" }}>
                <div className="dash-card__header">
                    <span className="dash-card__title">Foto de perfil</span>
                </div>
                <div className="dash-card__body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                    {/* Preview */}
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Avatar"
                            style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--c-gray-200)" }}
                        />
                    ) : (
                        <div style={{
                            width: 100, height: 100, borderRadius: "50%",
                            background: "var(--c-brand-accent)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 30, fontWeight: 700, color: "#fff",
                            border: "3px solid var(--c-gray-200)",
                        }}>
                            {initials}
                        </div>
                    )}

                    {/* Controls */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                        <button type="button" className="btn-secondary" style={{ width: "100%" }} onClick={() => fileRef.current?.click()}>
                            📷 Seleccionar imagen
                        </button>
                        {avatarPreview && (
                            <button type="button" className="btn-secondary" style={{ width: "100%", color: "var(--c-error)" }} onClick={() => setAvatarPreview(null)}>
                                🗑 Eliminar foto
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                        <p style={{ fontSize: 12, color: "var(--c-gray-400)", textAlign: "center" }}>JPG, PNG o WebP · Máx. 5 MB</p>
                    </div>

                    {/* Role & status badges */}
                    <div style={{ borderTop: "1px solid var(--c-gray-100)", paddingTop: 14, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Rol</div>
                            <span style={{
                                background: user.role === "SUPER_ADMIN" ? "#FEF2F2" : user.role === "ADMIN" ? "var(--c-brand-light)" : "var(--c-gray-100)",
                                color: user.role === "SUPER_ADMIN" ? "var(--c-error)" : user.role === "ADMIN" ? "var(--c-brand)" : "var(--c-gray-700)",
                                borderRadius: "var(--r-full)", padding: "3px 12px", fontSize: 12, fontWeight: 600,
                            }}>{user.role}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Estado</div>
                            <span style={{
                                background: user.status === "ACTIVE" ? "var(--c-success-bg)" : "var(--c-warning-bg)",
                                color: user.status === "ACTIVE" ? "var(--c-success)" : "var(--c-warning)",
                                borderRadius: "var(--r-full)", padding: "3px 12px", fontSize: 12, fontWeight: 600,
                            }}>{user.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info form card */}
            <div className="dash-card">
                <div className="dash-card__header">
                    <span className="dash-card__title">Información personal</span>
                </div>
                <div className="dash-card__body">
                    <form className="form-stack" onSubmit={handleSave}>
                        <div className="form-grid-2">
                            <label className="form-label">
                                Nombre
                                <input className="form-input" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Juan" />
                            </label>
                            <label className="form-label">
                                Apellido
                                <input className="form-input" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="García" />
                            </label>
                        </div>

                        <label className="form-label">
                            Nombre en pantalla
                            <input className="form-input" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Dr. Juan García" />
                            <span className="form-input-hint">Aparece en la barra lateral y en el dashboard</span>
                        </label>

                        <label className="form-label">
                            Cargo
                            <input className="form-input" type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Médico general" />
                        </label>

                        <label className="form-label">
                            Zona horaria
                            <select
                                className="form-input"
                                value={timezone}
                                onChange={e => setTimezone(e.target.value)}
                            >
                                {COMMON_TIMEZONES.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                            <span className="form-input-hint">Afecta el cálculo de &quot;citas de hoy&quot; en el servidor</span>
                        </label>

                        <div style={{ borderTop: "1px solid var(--c-gray-100)", paddingTop: 16 }}>
                            <label className="form-label" style={{ opacity: 0.7 }}>
                                Correo electrónico
                                <input className="form-input" type="email" value={user.email} readOnly style={{ background: "var(--c-gray-50)", cursor: "not-allowed" }} />
                                <span className="form-input-hint">El correo no se puede modificar</span>
                            </label>
                        </div>

                        {error && <div className="error-inline">⚠️ {error}</div>}
                        {success && <SuccessBanner message="Cambios guardados correctamente" />}

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? "Guardando…" : "Guardar cambios"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── Security Tab ──────────────────────────────────────────────────────────────

const PW_RULES = [
    { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
    { label: "Al menos una mayúscula", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Al menos una minúscula", test: (p: string) => /[a-z]/.test(p) },
    { label: "Al menos un número", test: (p: string) => /[0-9]/.test(p) },
    { label: "Al menos un símbolo especial", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

function SecurityTab() {
    const [ current, setCurrent ] = useState("");
    const [ next, setNext ] = useState("");
    const [ confirm, setConfirm ] = useState("");
    const [ saving, setSaving ] = useState(false);
    const [ success, setSuccess ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const rulesOk = PW_RULES.every(r => r.test(next));
    const mismatch = confirm.length > 0 && next !== confirm;
    const canSubmit = current && next && confirm && rulesOk && !mismatch && !saving;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError(null);
        try {
            const res = await fetchWithAuth(`${API_BASE}/auth/change-password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: current, newPassword: next }),
            });
            const json: ApiResponse = await res.json();
            if (!res.ok || !json.success) throw new Error((json as any).message ?? "Error al cambiar contraseña");
            setCurrent(""); setNext(""); setConfirm("");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al cambiar contraseña";
            setError(msg === "Current password is incorrect" ? "La contraseña actual es incorrecta" : msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ maxWidth: 460 }}>
            <div className="dash-card">
                <div className="dash-card__header">
                    <span className="dash-card__title">Cambiar contraseña</span>
                </div>
                <div className="dash-card__body">
                    <form className="form-stack" onSubmit={handleSubmit}>
                        <label className="form-label">
                            Contraseña actual
                            <input className="form-input" type="password" value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" placeholder="••••••••" required />
                        </label>

                        <label className="form-label">
                            Nueva contraseña
                            <input className="form-input" type="password" value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" placeholder="••••••••" required />
                        </label>

                        <label className="form-label">
                            Confirmar nueva contraseña
                            <input
                                className="form-input"
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                style={mismatch ? { borderColor: "var(--c-error)" } : undefined}
                                required
                            />
                            {mismatch && <span style={{ fontSize: 12, color: "var(--c-error)" }}>Las contraseñas no coinciden</span>}
                        </label>

                        {/* Live strength checker */}
                        {next.length > 0 && (
                            <div style={{ background: "var(--c-gray-50)", borderRadius: "var(--r-lg)", padding: "12px 14px" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Requisitos</div>
                                {PW_RULES.map(r => {
                                    const ok = r.test(next);
                                    return (
                                        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: ok ? "var(--c-success)" : "var(--c-gray-400)", marginBottom: 5 }}>
                                            <span style={{ fontWeight: 700 }}>{ok ? "✓" : "○"}</span>
                                            {r.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {error && <div className="error-inline">⚠️ {error}</div>}
                        {success && <SuccessBanner message="Contraseña actualizada. Las otras sesiones activas serán cerradas." />}

                        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 4 }}>
                            <button type="submit" className="btn-primary" disabled={!canSubmit}>
                                {saving ? "Actualizando…" : "Cambiar contraseña"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { user, updateUser } = useAuthContext();
    const [ tab, setTab ] = useState<Tab>("profile");

    return (
        <PageLayout>
            <PageHeader
                title="Configuración"
                subtitle="Gestiona tu perfil y seguridad"
                style={{ marginBottom: 28 }}
            />

            {/* Tabs */}
            <div className="tab-nav" style={{ width: "fit-content", marginBottom: 28 }}>
                <button className={`filter-chip ${tab === "profile" ? "filter-chip--active" : ""}`} onClick={() => setTab("profile")}>
                    👤 Perfil
                </button>
                <button className={`filter-chip ${tab === "security" ? "filter-chip--active" : ""}`} onClick={() => setTab("security")}>
                    🔒 Seguridad
                </button>
            </div>

            {tab === "profile" && user && (
                <ProfileTab user={user} updateUser={updateUser} />
            )}
            {tab === "security" && (
                <SecurityTab />
            )}
        </PageLayout>
    );
}