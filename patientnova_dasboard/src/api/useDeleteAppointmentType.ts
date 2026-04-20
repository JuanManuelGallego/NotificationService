import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { useApiMutation } from "./useApiMutation";

export const useDeleteAppointmentType = () => {
    const { mutate, loading, error } = useApiMutation("DELETE", "Failed to delete appointment type");
    const deleteAppointmentType = useCallback(
        async (id: string) => { await mutate(`${API_BASE}/appointment-types/${id}`); return true as const; },
        [ mutate ]
    );
    return { deleteAppointmentType, loading, error };
};