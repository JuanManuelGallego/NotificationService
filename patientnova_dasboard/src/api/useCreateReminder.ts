import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { Reminder } from "../types/Reminder";
import { useApiMutation } from "./useApiMutation";

export const useCreateReminder = () => {
    const { mutate, loading, error } = useApiMutation<Reminder>("POST", "Failed to create reminder");
    const createReminder = useCallback(
        (data: Partial<Reminder>) => mutate(`${API_BASE}/reminders`, data),
        [ mutate ]
    );
    return { createReminder, loading, error };
};