import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { Reminder } from "../types/Reminder";
import { useApiMutation } from "./useApiMutation";

export const useUpdateReminder = () => {
    const { mutate, loading, error } = useApiMutation<Reminder>("PATCH", "Failed to update reminder");
    const updateReminder = useCallback(
        (id: string, data: Partial<Reminder>) => mutate(`${API_BASE}/reminders/${id}`, data),
        [ mutate ]
    );
    return { updateReminder, loading, error };
};