import { useUpdateAppointment } from "@/src/api/useUpdateAppointment";
import { useUpdateReminder } from "@/src/api/useUpdateReminder";
import { Appointment, AppointmentStatus } from "@/src/types/Appointment";
import { ReminderStatus } from "@/src/types/Reminder";
import { fmtDate } from "@/src/utils/TimeUtils";
import { useState } from "react";

export function CancelAppointmentModal({ appt, onClose, onCanceled }: { appt: Appointment; onClose: () => void; onCanceled: () => void }) {
    const { updateAppointment, loading: cancelingAppt } = useUpdateAppointment();
    const { updateReminder, loading: cancelingReminder } = useUpdateReminder();
    const [ error, setError ] = useState<string | null>(null);

    async function handleCancel() {
        setError(null);
        try {
            await updateAppointment(appt.id, { status: AppointmentStatus.CANCELLED });
            if (appt.reminder && appt.reminder.id) await updateReminder(appt.reminder.id, { status: ReminderStatus.CANCELLED });
            onCanceled(); onClose();
        } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    }

    return (
        <div className="modal-overlay modal-overlay--nested" onClick={onClose}>
            <div className="modal-panel modal-panel--sm" onClick={e => e.stopPropagation()}>
                <div className="modal-confirm">
                    <div className="modal-confirm__icon">🚫</div>
                    <h2 className="modal-title modal-title--sm">Cancelar Cita</h2>
                    <p className="modal-confirm__text">
                        ¿Estás seguro que deseas cancelar la cita de <br /><strong>{appt.patient.name} {appt.patient.lastName}</strong> del <strong>{fmtDate(appt.startAt)}</strong>?
                    </p>
                </div>
                {error && <div className="error-inline">⚠️ {error}</div>}
                <div className="modal-confirm__actions">
                    <button onClick={onClose} className="btn-secondary btn-block" disabled={cancelingAppt || cancelingReminder}>Regresar</button>
                    <button onClick={handleCancel} disabled={cancelingAppt || cancelingReminder} className="btn-danger btn-block">
                        {cancelingAppt || cancelingReminder ? "Cancelando…" : "Sí, cancelar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
