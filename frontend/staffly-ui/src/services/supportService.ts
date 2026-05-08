import axios from "axios";
import type {
    CreateCommentPayload,
    CreateTicketPayload,
    Ticket,
    TicketComment,
    UpdateTicketAssignPayload,
    UpdateTicketStatusPayload,
} from "../types/ticket";

type TicketCommentApiResponse = {
    id: number;
    employeeId: number;
    comment: string;
    createdAt: string;
};

const supportApi = axios.create({
    baseURL: "http://localhost:8087",
});

supportApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") ?? localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const supportService = {
    getMyTickets: async (): Promise<Ticket[]> => {
        const response = await supportApi.get("/tickets/my");
        return response.data;
    },

    getAllTickets: async (): Promise<Ticket[]> => {
        const response = await supportApi.get("/tickets");
        return response.data;
    },

    getTicketById: async (id: number): Promise<Ticket> => {
        const response = await supportApi.get(`/tickets/${id}`);
        return response.data;
    },

    createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
        const response = await supportApi.post("/tickets", payload);
        return response.data;
    },

    updateTicketStatus: async (id: number, payload: UpdateTicketStatusPayload): Promise<Ticket> => {
        const response = await supportApi.put(`/tickets/${id}/status`, payload);
        return response.data;
    },

    assignTicket: async (id: number, payload: UpdateTicketAssignPayload): Promise<Ticket> => {
        const response = await supportApi.put(`/tickets/${id}/assign`, payload);
        return response.data;
    },

    getTicketComments: async (id: number): Promise<TicketComment[]> => {
        const response = await supportApi.get(`/tickets/${id}/comments`);
        const rows: TicketCommentApiResponse[] = response.data ?? [];
        return rows.map((c) => ({
            id: c.id,
            message: c.comment,
            createdAt: c.createdAt,
            authorName: `Employee #${c.employeeId}`,
        }));
    },

    addComment: async (id: number, payload: CreateCommentPayload): Promise<TicketComment> => {
        const response = await supportApi.post(`/tickets/${id}/comments`, payload);
        const c: TicketCommentApiResponse = response.data;
        return {
            id: c.id,
            message: c.comment,
            createdAt: c.createdAt,
            authorName: `Employee #${c.employeeId}`,
        };
    },
};
