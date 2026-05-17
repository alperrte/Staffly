import {
    CalendarDays,
    CheckCircle2,
    FolderKanban,
    Send,
    UserRound,
} from "lucide-react";
import { useState } from "react";
import {
    useAddCommentMutation,
    useTicketCommentsQuery,
    useTicketDetailQuery,
} from "../../hooks/useTickets";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { AppModal } from "./AppModal";
import { CommentItem } from "./CommentItem";
import { TicketBadge } from "./TicketBadge";

interface TicketDetailModalProps {
    ticketId?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

export function TicketDetailModal({
                                      ticketId,
                                      open,
                                      onOpenChange,
                                  }: TicketDetailModalProps) {
    const { data: ticket, isLoading } = useTicketDetailQuery(ticketId);
    const { data: comments, isLoading: isCommentsLoading } =
        useTicketCommentsQuery(ticketId);

    const addCommentMutation = useAddCommentMutation();
    const [newComment, setNewComment] = useState("");

    const submitComment = async () => {
        if (!ticketId || newComment.trim().length < 2) return;

        await addCommentMutation.mutateAsync({
            id: ticketId,
            payload: { message: newComment.trim() },
        });

        setNewComment("");
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Talep Detayı"
            description="Destek talebinin durumunu, çözüm bilgisini ve yorum geçmişini inceleyin."
            contentClassName="left-auto right-0 top-0 h-screen w-full max-w-2xl translate-x-0 translate-y-0 rounded-none border-l border-white/10"
        >
            {isLoading || !ticket ? (
                <div className="space-y-4">
                    <div className="h-40 animate-pulse rounded-3xl bg-slate-900/70" />
                    <div className="h-24 animate-pulse rounded-3xl bg-slate-900/70" />
                    <div className="h-24 animate-pulse rounded-3xl bg-slate-900/70" />
                </div>
            ) : (
                <div className="flex h-[calc(100vh-168px)] flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto pr-1 staffly-scroll">
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_35%),rgba(15,23,42,0.72)] p-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <TicketBadge type="status" value={ticket.status} />
                                <TicketBadge type="priority" value={ticket.priority} />
                            </div>

                            <h3 className="mt-4 text-xl font-bold leading-7 text-white">
                                {ticket.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                {ticket.description}
                            </p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <FolderKanban className="h-4 w-4 text-sky-300" />
                                        Kategori
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-slate-100">
                                        {ticket.category}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <CalendarDays className="h-4 w-4 text-sky-300" />
                                        Oluşturulma
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-slate-100">
                                        {formatDate(ticket.createdAt)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:col-span-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <UserRound className="h-4 w-4 text-sky-300" />
                                        Atanan Kişi
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-slate-100">
                                        {ticket.assignedTo ?? "Henüz atanmadı"}
                                    </p>
                                </div>
                            </div>

                            {ticket.status === "RESOLVED" && ticket.resolution ? (
                                <div className="mt-4 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Çözüm
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-emerald-50">
                                        {ticket.resolution}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-bold text-white">
                                        Yorum Geçmişi
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Talep üzerinde yapılan konuşmalar burada listelenir.
                                    </p>
                                </div>

                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-slate-300">
                                    {comments?.length ?? 0}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {isCommentsLoading ? (
                                    <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400">
                                        Yorumlar yükleniyor...
                                    </p>
                                ) : comments && comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))
                                ) : (
                                    <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-5 text-center text-sm text-slate-500">
                                        Henüz yorum eklenmemiş.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 p-3">
                        <Textarea
                            value={newComment}
                            onChange={(event) => setNewComment(event.target.value)}
                            placeholder="Yeni yorum ekle..."
                            className="min-h-24 rounded-2xl border-white/10 bg-slate-900/80"
                        />

                        <div className="mt-3 flex justify-end">
                            <Button
                                type="button"
                                onClick={submitComment}
                                disabled={
                                    addCommentMutation.isPending ||
                                    newComment.trim().length < 2
                                }
                            >
                                <Send className="h-4 w-4" />
                                {addCommentMutation.isPending
                                    ? "Gönderiliyor..."
                                    : "Yorum Ekle"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppModal>
    );
}