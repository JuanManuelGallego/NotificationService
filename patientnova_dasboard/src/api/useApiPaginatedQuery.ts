import { useState, useEffect, useCallback } from "react";
import { ApiPaginatedResponse } from "../types/API";
import { fetchWithAuth } from "./fetchWithAuth";

/**
 * Generic hook for fetching a paginated list.
 * Supports optional polling that pauses when the tab is hidden.
 */
export function useApiPaginatedQuery<T>(
    url: string,
    options?: { pollingIntervalMs?: number; errorMessage?: string }
) {
    const pollingIntervalMs = options?.pollingIntervalMs;
    const errorMessage = options?.errorMessage ?? "Failed to load data";

    const [ items, setItems ] = useState<T[]>([]);
    const [ total, setTotal ] = useState(0);
    const [ totalPages, setTotalPages ] = useState(0);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(url);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const json: ApiPaginatedResponse<T> = await res.json();
            if (!json.success) throw new Error("API returned an error");
            setItems(json.data.data);
            setTotal(json.data.total);
            setTotalPages(json.data.totalPages);
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

    return { items, loading, error, refetch: fetchData, total, totalPages };
}
