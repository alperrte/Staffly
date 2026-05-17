import axios from "axios";

const transportApi = axios.create({
    baseURL: "http://localhost:8090/api/v1",
});

transportApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export type TransportRoute = {
    id: number;
    routeCode: string;
    routeName: string;
    description?: string | null;
    originArea: string;
    destinationArea: string;
    serviceAreas: string[];
    capacity: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type TransportRequest = {
    id: number;
    employeeId: number;
    employeeName: string;
    employeeDistrict: string;
    employeeNeighborhood?: string | null;
    preferredRouteId?: number | null;
    preferredRouteCode?: string | null;
    preferredRouteName?: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    note?: string | null;
    reviewNote?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateTransportRequestPayload = {
    employeeId: number;
    employeeName: string;
    preferredRouteId: number;
    note?: string;
};

export type CreateTransportRoutePayload = {
    routeCode: string;
    routeName: string;
    description?: string;
    originArea: string;
    destinationArea: string;
    originLatitude: number;
    originLongitude: number;
    destinationLatitude: number;
    destinationLongitude: number;
    serviceAreas: string[];
    capacity: number;
    active?: boolean;
};

export type TransportRouteStop = {
    routeId: number;
    routeCode: string;
    routeName: string;
    stopOrder: number;
    stopName: string;
    latitude: number;
    longitude: number;
};

export const getActiveTransportRoutes = async (): Promise<TransportRoute[]> => {
    const response = await transportApi.get("/transport-routes/active");
    return Array.isArray(response.data) ? response.data : [];
};

export const getTransportRequestsByEmployee = async (
    employeeId: number
): Promise<TransportRequest[]> => {
    const response = await transportApi.get(`/transport-requests/employee/${employeeId}`);
    return Array.isArray(response.data) ? response.data : [];
};

export const getPendingTransportRequests = async (): Promise<TransportRequest[]> => {
    const response = await transportApi.get("/transport-requests/pending");
    return Array.isArray(response.data) ? response.data : [];
};

export const createTransportRequest = async (payload: CreateTransportRequestPayload) => {
    const response = await transportApi.post("/transport-requests", payload);
    return response.data;
};

export const createTransportRoute = async (payload: CreateTransportRoutePayload) => {
    const response = await transportApi.post<TransportRoute>("/transport-routes", payload);
    return response.data;
};

export const approveTransportRequest = async (requestId: number, note?: string) => {
    const response = await transportApi.patch<TransportRequest>(
        `/transport-requests/${requestId}/approve`,
        note ? { note } : undefined
    );
    return response.data;
};

export const rejectTransportRequest = async (requestId: number, note?: string) => {
    const response = await transportApi.patch<TransportRequest>(
        `/transport-requests/${requestId}/reject`,
        note ? { note } : undefined
    );
    return response.data;
};

export const getTransportRouteStops = async (routeId: number): Promise<TransportRouteStop[]> => {
    const response = await transportApi.get(`/transport-routes/${routeId}/stops`);
    return Array.isArray(response.data) ? response.data : [];
};
