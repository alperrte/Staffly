export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_USER" | "RESOLVED" | "CLOSED" | "REJECTED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Ticket {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    employeeId: number;
    assignedTo?: number | null;
}

export interface TicketComment {
    id: number;
    message: string;
    createdAt: string;
    authorName?: string | null;
}

export interface CreateTicketPayload {
    title: string;
    description: string;
    categoryId: number;
    priority: TicketPriority;
}

export interface UpdateTicketStatusPayload {
    statusId: number;
}

export interface UpdateTicketAssignPayload {
    employeeId: number;
}

export interface CreateCommentPayload {
    message: string;
}
