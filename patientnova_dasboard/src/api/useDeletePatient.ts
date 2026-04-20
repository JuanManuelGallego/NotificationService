import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { useApiMutation } from "./useApiMutation";

export const useDeletePatient = () => {
    const { mutate, loading, error } = useApiMutation("DELETE", "Failed to delete patient");
    const deletePatient = useCallback(
        async (id: string) => { await mutate(`${API_BASE}/patients/${id}`); return true as const; },
        [ mutate ]
    );
    return { deletePatient, loading, error };
};