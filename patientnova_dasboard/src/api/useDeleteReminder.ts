import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { useApiMutation } from "./useApiMutation";

export const useDeleteReminder = () => {
    const { mutate, loading, error } = useApiMutation("DELETE", "Failed to delete reminder");
    const deleteReminder = useCallback(
        async (id: string) => { await mutate(`${API_BASE}/reminders/${id}`); return true as const; },
        [ mutate ]
    );
    return { deleteReminder, loading, error };
};