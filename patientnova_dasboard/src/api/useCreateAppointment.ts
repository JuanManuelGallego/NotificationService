import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { Appointment } from "../types/Appointment";
import { useApiMutation } from "./useApiMutation";

export const useCreateAppointment = () => {
    const { mutate, loading, error } = useApiMutation<Appointment>("POST", "Failed to create appointment");
    const createAppointment = useCallback(
        (data: Partial<Appointment>) => mutate(`${API_BASE}/appointments`, data),
        [ mutate ]
    );
    return { createAppointment, loading, error };
};