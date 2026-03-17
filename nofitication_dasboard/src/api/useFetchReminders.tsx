import { useState, useEffect, useCallback } from "react";
import { API_BASE, ApiPaginatedResponse } from "../types/API";
import { Reminder } from "../types/Reminder";

export const useFetchReminders = () => {
    const [ reminders, setReminders ] = useState<Reminder[]>([]);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchReminders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/reminders`);

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const json: ApiPaginatedResponse = await res.json();

            if (!json.success) {
                throw new Error("API returned an error");
            }

            setReminders(json.data.data as Reminder[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load reminders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
        const interval = setInterval(fetchReminders, 60000); // Poll every 1 minute
        return () => clearInterval(interval);
    }, [ fetchReminders ]);

    return { reminders, loading, error, fetchReminders };
};
