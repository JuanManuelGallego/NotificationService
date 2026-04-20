import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { AppointmentType } from "../types/Appointment";
import { useApiMutation } from "./useApiMutation";

export const useCreateAppointmentType = () => {
    const { mutate, loading, error } = useApiMutation<AppointmentType>("POST", "Failed to create appointment type");
    const createAppointmentType = useCallback(
        (data: Partial<AppointmentType>) => mutate(`${API_BASE}/appointment-types`, data),
        [ mutate ]
    );
    return { createAppointmentType, loading, error };
};