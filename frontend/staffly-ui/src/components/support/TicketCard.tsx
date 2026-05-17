import { CalendarDays, ChevronRight, FolderKanban, MessageSquareText } from "lucide-react";
import type { Ticket } from "../../types/ticket";
import { TicketBadge } from "./TicketBadge";

interface TicketCardProps {
    ticket: Ticket;
    onClick?: () => void;
}

const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export function TicketCard({ ticket, onClick }: TicketCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.78),rgba(2,6,23,0.72))] p-5 text-left shadow-[0_18px_45px_rgba(2,6,23,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-sky-400/45 hover:shadow-[0_24px_55px_rgba(14,165,233,0.14)]"
        >
            <div className="absolute right-[-45px] top-[-45px] h-28 w-28 rounded-full bg-sky-500/10 blur-2xl transition group-hover:bg-sky-400/20" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <TicketBadge type="status" value={ticket.status} />
                    <TicketBadge type="priority" value={ticket.priority} />
                </div>

                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 transition group-hover:border-sky-400/40 group-hover:text-sky-200">
                    <ChevronRight className="h-4 w-4" />
                </span>
            </div>

            <div className="relative mt-5">
                <h3 className="line-clamp-1 text-base font-bold text-white">
                    {ticket.title}
                </h3>

                <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-400">
                    {ticket.description}
                </p>
            </div>

            <div className="relative mt-5 space-y-2 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FolderKanban className="h-3.5 w-3.5 text-sky-300" />
                    <span className="font-medium text-slate-300">{ticket.category}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 text-sky-300" />
                    <span>{formatDate(ticket.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MessageSquareText className="h-3.5 w-3.5 text-sky-300" />
                    <span>Detay ve yorumlar için aç</span>
                </div>
            </div>
        </button>
    );
}