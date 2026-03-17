import { useState, useEffect, useCallback } from "react";
import { API_BASE, ApiResponse } from "../types/API";
import { Patient } from "../types/Patient";

export const useFetchPatients = () => {
    const [ patients, setPatients ] = useState<Patient[]>([]);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/patients`);

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const json: ApiResponse = await res.json();

            if (!json.success) {
                throw new Error("API returned an error");
            }

            setPatients(json.data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load patients");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [ fetchPatients ]);

    return { patients, loading, error, fetchPatients };
};