import type { TicketPriority, TicketStatus } from "../../types/ticket";
import { cn } from "../../utils/cn";

const statusStyles: Record<TicketStatus, string> = {
    OPEN: "border-blue-400/25 bg-blue-400/10 text-blue-200",
    IN_PROGRESS: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    WAITING_USER: "border-violet-400/25 bg-violet-400/10 text-violet-200",
    RESOLVED: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    CLOSED: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    REJECTED: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

const priorityStyles: Record<TicketPriority, string> = {
    LOW: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    MEDIUM: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    HIGH: "border-orange-400/25 bg-orange-400/10 text-orange-200",
    CRITICAL: "border-red-400/25 bg-red-400/10 text-red-200",
};

const statusLabels: Record<TicketStatus, string> = {
    OPEN: "Açık",
    IN_PROGRESS: "İşlemde",
    WAITING_USER: "Yanıt Bekliyor",
    RESOLVED: "Çözüldü",
    CLOSED: "Kapalı",
    REJECTED: "Reddedildi",
};

const priorityLabels: Record<TicketPriority, string> = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
    CRITICAL: "Kritik",
};

interface TicketBadgeProps {
    type: "status" | "priority";
    value: TicketStatus | TicketPriority;
}

export function TicketBadge({ type, value }: TicketBadgeProps) {
    const style =
        type === "status"
            ? statusStyles[value as TicketStatus]
            : priorityStyles[value as TicketPriority];

    const label =
        type === "status"
            ? statusLabels[value as TicketStatus]
            : priorityLabels[value as TicketPriority];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide",
                style
            )}
        >
            {label}
        </span>
    );
}