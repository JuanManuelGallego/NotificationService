import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { Appointment } from "../types/Appointment";
import { useApiMutation } from "./useApiMutation";

export const useUpdateAppointment = () => {
    const { mutate, loading, error } = useApiMutation<Appointment>("PATCH", "Failed to update appointment");
    const updateAppointment = useCallback(
        (id: string, data: Partial<Appointment>) => mutate(`${API_BASE}/appointments/${id}`, data),
        [ mutate ]
    );
    return { updateAppointment, loading, error };
};