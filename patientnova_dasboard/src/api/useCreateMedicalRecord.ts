import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { MedicalRecord } from "../types/MedicalRecord";
import { useApiMutation } from "./useApiMutation";

export const useCreateMedicalRecord = () => {
    const { mutate, loading, error } = useApiMutation<MedicalRecord>("POST", "Failed to create medical record");
    const createMedicalRecord = useCallback(
        (data: Partial<MedicalRecord>) => mutate(`${API_BASE}/medical-records`, data),
        [ mutate ]
    );
    return { createMedicalRecord, loading, error };
};