import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { Patient } from "../types/Patient";
import { useApiMutation } from "./useApiMutation";

export const useUpdatePatient = () => {
    const { mutate, loading, error } = useApiMutation<Patient>("PATCH", "Failed to update patient");
    const updatePatient = useCallback(
        (id: string, data: Partial<Patient>) => mutate(`${API_BASE}/patients/${id}`, data),
        [ mutate ]
    );
    return { updatePatient, loading, error };
};