import { useUpdateReminder } from "@/src/api/useUpdateReminder";
import { Reminder, ReminderStatus } from "@/src/types/Reminder";
import { useState } from "react";

export function CancelReminderModal({ reminder, onClose, onCanceled }: {
    reminder: Reminder; onClose: () => void; onCanceled: () => void;
}) {
    const { updateReminder, loading: deleting } = useUpdateReminder();
    const [ error, setError ] = useState<string | null>(null);

    async function handleCancel() {
        setError(null);
        try {
            await updateReminder(reminder.id, { status: ReminderStatus.CANCELLED });
            onCanceled(); onClose();
        } catch (err) { setError(err instanceof Error ? err.message : "Error desconocido"); }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel modal-panel--sm" onClick={e => e.stopPropagation()}>
                <div className="modal-confirm">
                    <div className="modal-confirm__icon">🚫</div>
                    <h2 className="modal-title modal-title--sm">Cancelar Recordatorio</h2>
                    <p className="modal-confirm__text">
                        ¿Estás seguro que deseas cancelar el recordatorio para <strong>{reminder.patient?.name ?? "—"} {reminder.patient?.lastName ?? "—"}</strong>?
                    </p>
                </div>
                {error && (
                    <div className="error-inline">⚠️ {error}</div>
                )}
                <div className="modal-confirm__actions">
                    <button onClick={onClose} className="btn-secondary btn-block" disabled={deleting}>Regresar</button>
                    <button onClick={handleCancel} disabled={deleting} className="btn-danger btn-block">
                        {deleting ? "Cancelando…" : "Sí, cancelar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
