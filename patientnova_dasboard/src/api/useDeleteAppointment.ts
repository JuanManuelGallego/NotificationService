import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { useApiMutation } from "./useApiMutation";

export const useDeleteAppointment = () => {
    const { mutate, loading, error } = useApiMutation("DELETE", "Failed to delete appointment");
    const deleteAppointment = useCallback(
        async (id: string) => { await mutate(`${API_BASE}/appointments/${id}`); return true as const; },
        [ mutate ]
    );
    return { deleteAppointment, loading, error };
};