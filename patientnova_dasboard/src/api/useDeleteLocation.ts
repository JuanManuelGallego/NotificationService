import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { useApiMutation } from "./useApiMutation";

export const useDeleteLocation = () => {
    const { mutate, loading, error } = useApiMutation("DELETE", "Failed to delete location");
    const deleteLocation = useCallback(
        async (id: string) => { await mutate(`${API_BASE}/locations/${id}`); return true as const; },
        [ mutate ]
    );
    return { deleteLocation, loading, error };
};