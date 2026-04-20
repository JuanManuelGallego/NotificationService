import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { AppointmentType } from "../types/Appointment";
import { useApiMutation } from "./useApiMutation";

export const useUpdateAppointmentType = () => {
    const { mutate, loading, error } = useApiMutation<AppointmentType>("PATCH", "Failed to update appointment type");
    const updateAppointmentType = useCallback(
        (id: string, data: Partial<AppointmentType>) => mutate(`${API_BASE}/appointment-types/${id}`, data),
        [ mutate ]
    );
    return { updateAppointmentType, loading, error };
};