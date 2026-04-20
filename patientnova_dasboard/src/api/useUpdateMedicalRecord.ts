import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { MedicalRecord } from "../types/MedicalRecord";
import { useApiMutation } from "./useApiMutation";

export const useUpdateMedicalRecord = () => {
    const { mutate, loading, error } = useApiMutation<MedicalRecord>("PATCH", "Failed to update medical record");
    const updateMedicalRecord = useCallback(
        (id: string, data: Partial<MedicalRecord>) => mutate(`${API_BASE}/medical-records/${id}`, data),
        [ mutate ]
    );
    return { updateMedicalRecord, loading, error };
};