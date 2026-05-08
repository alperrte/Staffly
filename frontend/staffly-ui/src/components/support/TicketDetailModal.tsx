import { Send } from "lucide-react";
import { useState } from "react";
import { useAddCommentMutation, useTicketCommentsQuery, useTicketDetailQuery } from "../../hooks/useTickets";
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

export function TicketDetailModal({ ticketId, open, onOpenChange }: TicketDetailModalProps) {
    const { data: ticket, isLoading } = useTicketDetailQuery(ticketId);
    const { data: comments, isLoading: isCommentsLoading } = useTicketCommentsQuery(ticketId);
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
            title="Ticket Details"
            description="Ticket yaşam döngüsünü ve yorum geçmişini inceleyin."
            contentClassName="left-auto right-0 top-0 h-screen w-full max-w-xl translate-x-0 translate-y-0 rounded-none border-l border-white/10"
        >
            {isLoading || !ticket ? (
                <p className="text-sm text-slate-300">Yükleniyor...</p>
            ) : (
                <div className="flex h-[calc(100vh-120px)] flex-col">
                    <div className="space-y-3 overflow-y-auto pr-1 staffly-scroll">
                        <div className="rounded-xl border border-white/10 bg-slate-900/55 p-4">
                            <h3 className="text-base font-semibold text-slate-50">{ticket.title}</h3>
                            <p className="mt-2 text-sm text-slate-300">{ticket.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <TicketBadge type="status" value={ticket.status} />
                                <TicketBadge type="priority" value={ticket.priority} />
                                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                                    {ticket.category}
                                </span>
                            </div>
                            <div className="mt-3 text-xs text-slate-400">
                                <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                                <p>Assigned To: {ticket.assignedTo ?? "-"}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-2 text-sm font-semibold text-slate-100">Comments Timeline</h4>
                            <div className="space-y-2">
                                {isCommentsLoading ? (
                                    <p className="text-xs text-slate-400">Comments yükleniyor...</p>
                                ) : comments && comments.length > 0 ? (
                                    comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
                                ) : (
                                    <p className="text-xs text-slate-400">Henüz yorum yok.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 border-t border-white/10 pt-3">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Yeni yorum ekle..."
                            className="min-h-24"
                        />
                        <div className="mt-2 flex justify-end">
                            <Button
                                type="button"
                                onClick={submitComment}
                                disabled={addCommentMutation.isPending || newComment.trim().length < 2}
                            >
                                <Send className="h-4 w-4" />
                                {addCommentMutation.isPending ? "Sending..." : "Add Comment"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppModal>
    );
}
