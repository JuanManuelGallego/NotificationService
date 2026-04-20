import { useCallback } from "react";
import { API_BASE } from "../types/API";
import { User } from "../types/User";
import { useApiMutation } from "./useApiMutation";

export const useUpdateProfile = () => {
    const { mutate, loading, error } = useApiMutation<User>("PATCH", "Error al guardar");
    const updateProfile = useCallback(
        (data: Partial<User>) => mutate(`${API_BASE}/users/me`, data),
        [ mutate ]
    );
    return { updateProfile, loading, error };
};