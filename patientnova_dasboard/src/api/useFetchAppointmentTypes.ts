import { API_BASE } from "../types/API";
import { AppointmentType } from "../types/Appointment";
import { useApiQuery } from "./useApiQuery";

export const useFetchAppointmentTypes = () => {
    const { data, loading, error, refetch: fetchAppointmentTypes } =
        useApiQuery<AppointmentType[]>(`${API_BASE}/appointment-types`, { errorMessage: "Failed to load appointment types" });
    return { appointmentTypes: data ?? [], loading, error, fetchAppointmentTypes };
};