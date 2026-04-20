import { API_BASE, ReminderStats } from "../types/API";
import { useApiQuery } from "./useApiQuery";

export const useFetchRemindersStats = () => {
    const { data: stats, loading, error, refetch: fetchStats } =
        useApiQuery<ReminderStats>(`${API_BASE}/reminders/stats`, { pollingIntervalMs: 60000, errorMessage: "Failed to load reminder stats" });
    return { stats, loading, error, fetchStats };
};