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
    departmentId: number;
    assignedTo?: number | null;
    resolution?: string | null;
}

export interface TicketComment {
    id: number;
    message: string;
    createdAt: string;
    authorName?: string | null;
    departmentName?: string | null;
}

export interface CreateTicketPayload {
    title: string;
    description: string;
    categoryId: number;
    departmentId: number;
    priority: TicketPriority;
}

export interface UpdateTicketStatusPayload {
    statusId: number;
    resolution?: string;
}

export interface UpdateTicketAssignPayload {
    employeeId: number;
}

export interface CreateCommentPayload {
    message: string;
}
