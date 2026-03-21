import { PatientStatus } from './Patient';
export interface ApiPaginatedResponse {
    success: boolean;
    data: {
        data: unknown;
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
    timestamp: string;
}

export interface ApiResponse {
    success: boolean;
    data: unknown;
    timestamp: string;
}

export interface PatientStats {
    total: number;
    byStatus: {
        [ PatientStatus.ACTIVE ]: number;
        [ PatientStatus.INACTIVE ]: number;
        [ PatientStatus.ARCHIVED ]: number;
    };
}

export const API_BASE = "http://localhost:3001";
