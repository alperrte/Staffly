import {
    BarChart3,
    CheckCircle2,
    Clock3,
    Filter,
    LifeBuoy,
    Plus,
    Search,
    Ticket,
    TicketX,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CreateTicketModal } from "../../components/support/CreateTicketModal";
import { TicketCard } from "../../components/support/TicketCard";
import { TicketDetailModal } from "../../components/support/TicketDetailModal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useMyTicketsQuery } from "../../hooks/useTickets";
import type { TicketStatus } from "../../types/ticket";

const statusFilters: Array<"ALL" | TicketStatus> = [
    "ALL",
    "OPEN",
    "IN_PROGRESS",
    "WAITING_USER",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
];

const statusLabels: Record<"ALL" | TicketStatus, string> = {
    ALL: "Tümü",
    OPEN: "Açık",
    IN_PROGRESS: "İşlemde",
    WAITING_USER: "Yanıt Bekliyor",
    RESOLVED: "Çözüldü",
    CLOSED: "Kapalı",
    REJECTED: "Reddedildi",
};

const MyTicketsPage = () => {
    const { data: tickets, isLoading } = useMyTicketsQuery();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number>();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");

    const sortedTickets = useMemo(
        () =>
            [...(tickets ?? [])].sort(
                (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
            ),
        [tickets]
    );

    const filteredTickets = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sortedTickets.filter((ticket) => {
            const matchesSearch =
                query.length === 0 ||
                ticket.title.toLowerCase().includes(query) ||
                ticket.description.toLowerCase().includes(query) ||
                ticket.category.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" || ticket.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [search, sortedTickets, statusFilter]);

    const totalCount = sortedTickets.length;
    const openCount = sortedTickets.filter((ticket) => ticket.status === "OPEN").length;
    const activeCount = sortedTickets.filter((ticket) =>
        ["IN_PROGRESS", "WAITING_USER"].includes(ticket.status)
    ).length;
    const resolvedCount = sortedTickets.filter(
        (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED"
    ).length;

    return (
        <div className="min-h-full space-y-6 text-slate-100">
            <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.20),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-6 shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
                <div className="absolute right-[-80px] top-[-90px] h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
                <div className="absolute bottom-[-120px] left-[30%] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                            <LifeBuoy className="h-3.5 w-3.5" />
                            Çalışan Destek Merkezi
                        </div>

                        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Destek Taleplerim
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                            Açtığınız destek taleplerini takip edin, durumlarını görüntüleyin
                            ve gerektiğinde talep detayına yorum ekleyin.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-11 rounded-2xl px-5 shadow-[0_16px_36px_rgba(14,165,233,0.22)]"
                    >
                        <Plus className="h-4 w-4" />
                        Yeni Talep Oluştur
                    </Button>
                </div>

                <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">Toplam Talep</span>
                            <Ticket className="h-4 w-4 text-sky-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">{totalCount}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">Açık</span>
                            <Clock3 className="h-4 w-4 text-blue-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">{openCount}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">Devam Eden</span>
                            <BarChart3 className="h-4 w-4 text-amber-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">{activeCount}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">Tamamlanan</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">{resolvedCount}</p>
                    </div>
                </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-4 shadow-[0_18px_55px_rgba(2,6,23,0.30)] backdrop-blur-xl">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">Talep Listesi</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Talep başlığı, açıklama veya kategoriye göre arama yapabilirsiniz.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-80">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Talep ara..."
                                className="h-11 rounded-2xl border-white/10 bg-slate-900/70 pl-10"
                            />
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                            <Filter className="h-4 w-4 text-sky-300" />
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value as "ALL" | TicketStatus)
                                }
                                className="bg-transparent text-sm outline-none"
                            >
                                {statusFilters.map((status) => (
                                    <option key={status} value={status} className="bg-slate-950">
                                        {statusLabels[status]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    {isLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-52 animate-pulse rounded-3xl border border-white/10 bg-slate-900/60"
                                />
                            ))}
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/45 px-6 py-14 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                                <TicketX className="h-8 w-8" />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-white">
                                Talep bulunamadı
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                Arama veya filtre sonucunda görüntülenecek destek talebi bulunamadı.
                                Yeni bir destek talebi oluşturarak süreci başlatabilirsiniz.
                            </p>

                            <Button className="mt-5" onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Yeni Talep Oluştur
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
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