import { useUpdatePatient } from "@/src/api/useUpdatePatient";
import { Patient, PatientStatus } from "@/src/types/Patient";
import { useState } from "react";

export function ArchivePatientModal({ patient, onClose, onDeleted }: {
    patient: Patient; onClose: () => void; onDeleted: () => void;
}) {
    const { updatePatient, loading: deleting } = useUpdatePatient();
    const [ error, setError ] = useState<string | null>(null);

    async function handleArchive() {
        setError(null);
        try {
            await updatePatient(patient.id, { status: PatientStatus.ARCHIVED });
            onDeleted(); onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel modal-panel--sm" onClick={e => e.stopPropagation()}>
                <div className="modal-confirm">
                    <div className="modal-confirm__icon">🗑️</div>
                    <h2 className="modal-title modal-title--sm">Eliminar Paciente</h2>
                    <p className="modal-confirm__text">
                        ¿Estás seguro que deseas eliminar a <strong>{patient.name} {patient.lastName}</strong>?
                    </p>
                    <p className="modal-confirm__text">Esta acción no se puede deshacer.</p>
                </div>
                {error && (
                    <div className="error-inline">⚠️ {error}</div>
                )}
                <div className="modal-confirm__actions">
                    <button onClick={onClose} className="btn-secondary btn-block" disabled={deleting}>Cancelar</button>
                    <button onClick={handleArchive} disabled={deleting} className="btn-danger btn-block">
                        {deleting ? "Eliminando…" : "Sí, eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
