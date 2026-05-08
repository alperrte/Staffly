import { Calendar, Tag } from "lucide-react";
import type { Ticket } from "../../types/ticket";
import { TicketBadge } from "./TicketBadge";

interface TicketCardProps {
    ticket: Ticket;
    onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/45 p-5 text-left shadow-[0_12px_30px_rgba(2,6,23,0.35)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-sky-400/45 hover:shadow-[0_18px_34px_rgba(14,165,233,0.15)]"
        >
            <div className="flex flex-wrap items-center gap-2">
                <TicketBadge type="status" value={ticket.status} />
                <TicketBadge type="priority" value={ticket.priority} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-50">{ticket.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-slate-300">{ticket.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-sky-300" />
                    {ticket.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-sky-300" />
                    {new Date(ticket.createdAt).toLocaleString()}
                </span>
            </div>
        </button>
    );
}
