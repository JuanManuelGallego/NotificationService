import { useState, useEffect, useCallback } from "react";
import { ApiResponse } from "../types/API";
import { fetchWithAuth } from "./fetchWithAuth";

/**
 * Generic hook for fetching a single resource.
 * Pass `url = null` to skip the fetch (e.g. when a required ID is not yet available).
 * Supports optional polling that pauses when the tab is hidden.
 */
export function useApiQuery<T>(
    url: string | null,
    options?: { pollingIntervalMs?: number; errorMessage?: string }
) {
    const pollingIntervalMs = options?.pollingIntervalMs;
    const errorMessage = options?.errorMessage ?? "Failed to load data";

    const [ data, setData ] = useState<T | undefined>();
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(url);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const json: ApiResponse<T> = await res.json();
            if (!json.success) throw new Error("API returned an error");
            setData(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : errorMessage);
        } finally {
            setLoading(false);
        }
    }, [ url, errorMessage ]);

    useEffect(() => {
        fetchData();
        if (!pollingIntervalMs) return;
        const interval = setInterval(() => {
            if (!document.hidden) fetchData();
        }, pollingIntervalMs);
        return () => clearInterval(interval);
    }, [ fetchData, pollingIntervalMs ]);

    return { data, loading, error, refetch: fetchData };
}
