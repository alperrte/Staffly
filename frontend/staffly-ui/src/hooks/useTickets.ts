import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportService } from "../services/supportService";
import type {
    CreateCommentPayload,
    CreateTicketPayload,
    UpdateTicketAssignPayload,
    UpdateTicketStatusPayload,
} from "../types/ticket";

export const ticketKeys = {
    all: ["tickets"] as const,
    my: ["tickets", "my"] as const,
    list: ["tickets", "list"] as const,
    detail: (id: number) => ["tickets", "detail", id] as const,
    comments: (id: number) => ["tickets", "comments", id] as const,
};

export function useMyTicketsQuery() {
    return useQuery({
        queryKey: ticketKeys.my,
        queryFn: supportService.getMyTickets,
    });
}

export function useAllTicketsQuery() {
    return useQuery({
        queryKey: ticketKeys.list,
        queryFn: supportService.getAllTickets,
    });
}

export function useTicketDetailQuery(ticketId?: number) {
    return useQuery({
        queryKey: ticketId ? ticketKeys.detail(ticketId) : ticketKeys.detail(-1),
        queryFn: () => supportService.getTicketById(ticketId as number),
        enabled: Boolean(ticketId),
    });
}

export function useTicketCommentsQuery(ticketId?: number) {
    return useQuery({
        queryKey: ticketId ? ticketKeys.comments(ticketId) : ticketKeys.comments(-1),
        queryFn: () => supportService.getTicketComments(ticketId as number),
        enabled: Boolean(ticketId),
    });
}

export function useCreateTicketMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTicketPayload) => supportService.createTicket(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ticketKeys.my });
            void queryClient.invalidateQueries({ queryKey: ticketKeys.list });
        },
    });
}

export function useUpdateTicketStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateTicketStatusPayload }) =>
            supportService.updateTicketStatus(id, payload),
        onSuccess: (ticket) => {
            void queryClient.invalidateQueries({ queryKey: ticketKeys.my });
            void queryClient.invalidateQueries({ queryKey: ticketKeys.list });
            void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) });
        },
    });
}

export function useAssignTicketMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateTicketAssignPayload }) =>
            supportService.assignTicket(id, payload),
        onSuccess: (ticket) => {
            void queryClient.invalidateQueries({ queryKey: ticketKeys.list });
            void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) });
        },
    });
}

export function useAddCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: CreateCommentPayload }) =>
            supportService.addComment(id, payload),
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({ queryKey: ticketKeys.comments(variables.id) });
        },
    });
}
