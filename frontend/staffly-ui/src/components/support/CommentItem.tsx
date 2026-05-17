import { MessageCircleMore } from "lucide-react";
import type { TicketComment } from "../../types/ticket";

interface CommentItemProps {
    comment: TicketComment;
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

export function CommentItem({ comment }: CommentItemProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <span className="absolute left-0 top-4 h-10 w-1 rounded-r-full bg-sky-400/70" />

            <div className="flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
                        <MessageCircleMore className="h-4 w-4" />
                    </span>
                    <span>
                        {comment.authorName || "Employee"}
                        {comment.departmentName && (
                            <span className="ml-2 text-slate-500">/ {comment.departmentName}</span>
                        )}
                    </span>
                </div>

                <span className="shrink-0 text-[11px] text-slate-500">
                    {formatDate(comment.createdAt)}
                </span>
            </div>

            <p className="mt-3 pl-10 text-sm leading-6 text-slate-300">
                {comment.message}
            </p>
        </div>
    );
}
