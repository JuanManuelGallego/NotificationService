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


export const API_BASE = "http://localhost:3001";
