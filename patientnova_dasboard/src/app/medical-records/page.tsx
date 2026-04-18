"use client";
import { Suspense, useState } from "react";

import { ErrorBanner } from "@/src/components/Info/ErrorBanner";
import { useFetchPatients } from "@/src/api/useFetchPatients";
import PageLayout from "@/src/components/PageLayout";
import { PageHeader } from "@/src/components/PageHeader";
import { CustomSelect } from "@/src/components/CustomSelect";
import { RequiredField } from "@/src/components/Info/Requiered";
import { getPatientFullName } from "@/src/utils/AvatarHelper";
import { FormValues, createEmptyMember, createEmptyNote } from "@/src/types/MedicalRecord";
import { GeneralDataSection } from "@/src/components/GeneralDataSection";
import { FamilyTable } from "@/src/components/FamilyTable";
import { AntecedentsSection } from "@/src/components/AntecedentsSection";
import { EvolutionNotes } from "@/src/components/EvolutionNotes";
import { todayString } from "@/src/utils/TimeUtils";
import { parseAsString, useQueryState } from "nuqs";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { MedicalRecordCard } from "@/src/components/MedicalRecordCard";

function MedicalRecordsPageContent() {
  const { patients, loading, error, fetchPatients } = useFetchPatients();
  const [ selectedPatientId, setSelectedPatientId ] = useQueryState("patientId", parseAsString.withDefault(""));
  const [ form, setForm ] = useState<FormValues>({
    name: "",
    nationalId: "",
    sex: "",
    age: "",
    birthDate: "",
    birthPlace: "",
    consultationReason: "",
    earlyDevelopment: "",
    schoolAndWork: "",
    lifestyleHabits: "",
    traumaticEvents: "",
    emotionalConsiderations: "",
    physicalConsiderations: "",
    mentalHistory: "",
    objective: "",
    familyMembers: [ createEmptyMember() ],
    evolutionNotes: [ createEmptyNote() ],
  });

  const [ saving, setSaving ] = useState(false);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [ key ]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement save logic
    setTimeout(() => setSaving(false), 2000); // Mock save
  };

  return (
    <PageLayout>
      <PageHeader
        title="Historias clínicas"
        subtitle={todayString()}
      />
      {error && <ErrorBanner msg={error} onRetry={fetchPatients} />}
      <div style={{ display: "grid", gap: 24 }}>
        <MedicalRecordCard title="Seleccionar Paciente" icon="👤">
          <label className="form-label">
            <RequiredField label="Paciente" />
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
                <LoadingSpinner />
                <span>Cargando pacientes...</span>
              </div>
            ) : (
              <CustomSelect
                value={selectedPatientId || ""}
                placeholder="Seleccionar paciente…"
                options={patients.length > 0
                  ? patients.map((p) => ({ value: p.id, label: getPatientFullName(p) }))
                  : [ { value: "", label: "No hay pacientes registrados" } ]
                }
                onChange={setSelectedPatientId}
              />
            )}
          </label>
        </MedicalRecordCard>

        {selectedPatientId && (
          <>
            <MedicalRecordCard title="Datos Generales" icon="📋">
              <GeneralDataSection form={form} onChange={updateForm} />
            </MedicalRecordCard>
            <MedicalRecordCard title="Composición Familiar" icon="👨‍👩‍👧‍👦">
              <FamilyTable
                familyMembers={form.familyMembers || []}
                onChange={(familyMembers) => setForm((current) => ({ ...current, familyMembers }))}
              />
            </MedicalRecordCard>
            <MedicalRecordCard title="Antecedentes" icon="📚">
              <AntecedentsSection form={form} onChange={updateForm} />
            </MedicalRecordCard>
            <MedicalRecordCard title="Notas de Evolución" icon="📝">
              <EvolutionNotes
                evolutionNotes={form.evolutionNotes || []}
                onChange={(evolutionNotes) => setForm((current) => ({ ...current, evolutionNotes }))}
              />
            </MedicalRecordCard>
            <div style={{
              position: "sticky",
              bottom: 0,
              background: "var(--c-surface)",
              borderRadius: "var(--r-3xl) var(--r-3xl) 0 0",
              boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.10)",
              borderTop: "1px solid var(--c-border, rgba(0,0,0,0.06))",
              padding: 15,
              margin: "0 -24px -24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10
            }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                Guardar historia clínica
              </button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default function MedicalRecordsPage() {
  return (
    <Suspense>
      <MedicalRecordsPageContent />
    </Suspense>
  );
}
