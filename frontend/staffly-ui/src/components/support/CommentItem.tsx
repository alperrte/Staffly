import { MessageCircleMore } from "lucide-react";
import type { TicketComment } from "../../types/ticket";

interface CommentItemProps {
    comment: TicketComment;
}

export function CommentItem({ comment }: CommentItemProps) {
    return (
        <div className="relative rounded-xl border border-white/10 bg-slate-900/55 p-3 pl-4">
            <span className="absolute left-0 top-4 h-8 w-0.5 rounded-full bg-sky-400/70" />
            <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-xs text-slate-300">
                    <MessageCircleMore className="h-3.5 w-3.5 text-sky-300" />
                    {comment.authorName || "Employee"}
                </div>
                <span className="text-[11px] text-slate-400">
                    {new Date(comment.createdAt).toLocaleString()}
                </span>
            </div>
            <p className="mt-2 text-sm text-slate-100">{comment.message}</p>
        </div>
    );
}
