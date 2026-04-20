import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { Patient } from "../types/Patient";
import { useApiMutation } from "./useApiMutation";

export const useCreatePatient = () => {
    const { mutate, loading, error } = useApiMutation<Patient>("POST", "Failed to create patient");
    const createPatient = useCallback(
        (data: Partial<Patient>) => mutate(`${API_BASE}/patients`, data),
        [ mutate ]
    );
    return { createPatient, loading, error };
};