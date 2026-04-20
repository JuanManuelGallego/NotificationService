import { useState, useCallback } from "react";
import { ApiResponse } from "../types/API";
import { fetchWithAuth } from "./fetchWithAuth";

/**
 * Generic hook for data mutations (POST, PATCH, PUT, DELETE).
 * Call `mutate(url, body?)` to execute the request.
 */
export function useApiMutation<TOutput = void>(
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    errorMessage = "Operation failed"
) {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const mutate = useCallback(async (url: string, body?: unknown): Promise<TOutput> => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(url, {
                method,
                headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
                body: body !== undefined ? JSON.stringify(body) : undefined,
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const json: ApiResponse<TOutput> = await res.json();
            if (!json.success) throw new Error("API returned an error");
            return json.data;
        } catch (err) {
            const msg = err instanceof Error ? err.message : errorMessage;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ method, errorMessage ]);

    return { mutate, loading, error };
}
