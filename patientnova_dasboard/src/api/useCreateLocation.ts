import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { AppointmentLocation } from "../types/Appointment";
import { useApiMutation } from "./useApiMutation";

export const useCreateLocation = () => {
    const { mutate, loading, error } = useApiMutation<AppointmentLocation>("POST", "Failed to create location");
    const createLocation = useCallback(
        (data: Partial<AppointmentLocation>) => mutate(`${API_BASE}/locations`, data),
        [ mutate ]
    );
    return { createLocation, loading, error };
};