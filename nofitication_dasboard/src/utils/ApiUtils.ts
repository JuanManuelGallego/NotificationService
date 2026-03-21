import { PatientStatus, FetchPatientsFilters } from "../types/Patient";

export const DEFAULT_STATUS = [ PatientStatus.ACTIVE, PatientStatus.INACTIVE ];

export const buildPatientQueryString = (filters?: FetchPatientsFilters): string => {
    const params = new URLSearchParams();

    const statusList =
        filters?.status
            ? Array.isArray(filters.status)
                ? filters.status
                : [ filters.status ]
            : DEFAULT_STATUS;

    statusList.forEach(s => params.append("status", s));

    if (filters?.search?.trim()) {
        params.set("search", filters.search.trim());
    }

    if (filters?.page && filters.page > 0) {
        params.set("page", String(filters.page));
    }

    if (filters?.pageSize && filters.pageSize > 0) {
        params.set("pageSize", String(filters.pageSize));
    }

    if (filters?.orderBy) {
        params.set("orderBy", filters.orderBy);
    }

    if (filters?.order) {
        params.set("order", filters.order);
    }

    if (filters?.from) {
        params.set(
            "from",
            filters.from instanceof Date ? filters.from.toISOString() : filters.from
        );
    }

    if (filters?.to) {
        params.set(
            "to",
            filters.to instanceof Date ? filters.to.toISOString() : filters.to
        );
    }

    const qs = params.toString();
    return qs ? `?${qs}` : "";
};
