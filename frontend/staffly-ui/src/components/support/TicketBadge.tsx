import type { TicketPriority, TicketStatus } from "../../types/ticket";
import { cn } from "../../utils/cn";

const statusStyles: Record<TicketStatus, string> = {
    OPEN: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    IN_PROGRESS: "bg-yellow-500/15 text-yellow-300 border-yellow-400/30",
    WAITING_USER: "bg-violet-500/15 text-violet-300 border-violet-400/30",
    RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    CLOSED: "bg-slate-500/20 text-slate-300 border-slate-400/30",
    REJECTED: "bg-red-500/15 text-red-300 border-red-400/30",
};

const priorityStyles: Record<TicketPriority, string> = {
    LOW: "bg-slate-500/20 text-slate-300 border-slate-400/30",
    MEDIUM: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    HIGH: "bg-orange-500/15 text-orange-300 border-orange-400/30",
    CRITICAL: "bg-red-500/15 text-red-300 border-red-400/30",
};

interface TicketBadgeProps {
    type: "status" | "priority";
    value: TicketStatus | TicketPriority;
}

export function TicketBadge({ type, value }: TicketBadgeProps) {
    const style = type === "status" ? statusStyles[value as TicketStatus] : priorityStyles[value as TicketPriority];
    return (
        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", style)}>
            {value.replaceAll("_", " ")}
        </span>
    );
}
