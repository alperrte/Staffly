import { Plus, TicketX } from "lucide-react";
import { useMemo, useState } from "react";
import { CreateTicketModal } from "../../components/support/CreateTicketModal";
import { TicketCard } from "../../components/support/TicketCard";
import { TicketDetailModal } from "../../components/support/TicketDetailModal";
import { Button } from "../../components/ui/button";
import { useMyTicketsQuery } from "../../hooks/useTickets";

const MyTicketsPage = () => {
    const { data: tickets, isLoading } = useMyTicketsQuery();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number>();

    const sortedTickets = useMemo(
        () => [...(tickets ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
        [tickets]
    );

    return (
        <div className="space-y-6 text-slate-100">
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/40 via-slate-900/55 to-slate-950/50 p-5 shadow-[0_14px_34px_rgba(2,6,23,0.4)] backdrop-blur-xl">
                <div>
                    <h2 className="text-xl font-semibold">My Support Tickets</h2>
                    <p className="mt-1 text-sm text-slate-300">Destek taleplerinizi tek ekranda takip edin.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create Ticket
                </Button>
            </section>

            <section className="space-y-3">
                {isLoading ? (
                    <p className="text-sm text-slate-300">Ticketlar yükleniyor...</p>
                ) : sortedTickets.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/35 p-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                            <TicketX className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-50">Henüz ticket bulunmuyor</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            İlk ticket talebinizi oluşturup süreci başlatabilirsiniz.
                        </p>
                        <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                            Create Ticket
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {sortedTickets.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} onClick={() => setSelectedTicketId(ticket.id)} />
                        ))}
                    </div>
                )}
            </section>

            <CreateTicketModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            <TicketDetailModal
                open={Boolean(selectedTicketId)}
                ticketId={selectedTicketId}
                onOpenChange={(open) => {
                    if (!open) setSelectedTicketId(undefined);
                }}
            />
        </div>
    );
};

export default MyTicketsPage;
