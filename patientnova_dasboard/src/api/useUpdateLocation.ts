import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { AppointmentLocation } from "../types/Appointment";
import { useApiMutation } from "./useApiMutation";

export const useUpdateLocation = () => {
    const { mutate, loading, error } = useApiMutation<AppointmentLocation>("PATCH", "Failed to update location");
    const updateLocation = useCallback(
        (id: string, data: Partial<AppointmentLocation>) => mutate(`${API_BASE}/locations/${id}`, data),
        [ mutate ]
    );
    return { updateLocation, loading, error };
};