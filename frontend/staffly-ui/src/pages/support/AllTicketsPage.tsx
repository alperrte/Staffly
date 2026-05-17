import {
    CheckCircle2,
    ClipboardCheck,
    Eye,
    Filter,
    Inbox,
    Search,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { TicketBadge } from "../../components/support/TicketBadge";
import { TicketDetailModal } from "../../components/support/TicketDetailModal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    useAllTicketsQuery,
    useClaimTicketMutation,
    useUpdateTicketStatusMutation,
} from "../../hooks/useTickets";
import type { TicketPriority, TicketStatus } from "../../types/ticket";

const statusOptions: TicketStatus[] = [
    "OPEN",
    "IN_PROGRESS",
    "WAITING_USER",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
];

const priorityOptions: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const categoryOptions = [
    "ALL",
    "Technical",
    "Payroll",
    "Leave",
    "Onboarding",
    "Equipment",
    "Other",
];

const STATUS_NAME_TO_ID: Record<TicketStatus, number> = {
    OPEN: 1,
    IN_PROGRESS: 2,
    WAITING_USER: 3,
    RESOLVED: 4,
    CLOSED: 5,
    REJECTED: 6,
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

const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const AllTicketsPage = () => {
    const { data: tickets, isLoading } = useAllTicketsQuery();

    const updateStatusMutation = useUpdateTicketStatusMutation();
    const claimTicketMutation = useClaimTicketMutation();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
    const [selectedTicketId, setSelectedTicketId] = useState<number>();
    const [resolutionById, setResolutionById] = useState<Record<number, string>>({});

    const filteredTickets = useMemo(() => {
        const q = search.trim().toLowerCase();

        return (tickets ?? [])
            .filter((ticket) => {
                const matchesSearch =
                    q.length === 0 ||
                    ticket.title.toLowerCase().includes(q) ||
                    ticket.description.toLowerCase().includes(q) ||
                    ticket.category.toLowerCase().includes(q);

                const matchesStatus =
                    statusFilter === "ALL" || ticket.status === statusFilter;

                const matchesPriority =
                    priorityFilter === "ALL" || ticket.priority === priorityFilter;

                const matchesCategory =
                    categoryFilter === "ALL" || ticket.category === categoryFilter;

                return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
            })
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }, [categoryFilter, priorityFilter, search, statusFilter, tickets]);

    const totalCount = tickets?.length ?? 0;
    const unassignedCount =
        tickets?.filter((ticket) => !ticket.assignedTo).length ?? 0;
    const inProgressCount =
        tickets?.filter((ticket) => ticket.status === "IN_PROGRESS").length ?? 0;
    const resolvedCount =
        tickets?.filter(
            (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED"
        ).length ?? 0;

    return (
        <div className="min-h-full space-y-6 text-slate-100">
            <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-6 shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
                <div className="absolute right-[-90px] top-[-90px] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Departman Destek Havuzu
                    </div>

                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Destek Talepleri Yönetimi
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                        Departmanınıza iletilen destek taleplerini üstlenin, çözüm
                        açıklaması ekleyin ve talep yaşam döngüsünü yönetin.
                    </p>
                </div>

                <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">Toplam</span>
                            <Inbox className="h-4 w-4 text-sky-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">{totalCount}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">
                                Atanmamış
                            </span>
                            <UserCheck className="h-4 w-4 text-amber-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">
                            {unassignedCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">
                                İşlemde
                            </span>
                            <ClipboardCheck className="h-4 w-4 text-violet-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">
                            {inProgressCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">
                                Tamamlanan
                            </span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">
                            {resolvedCount}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-4 shadow-[0_18px_55px_rgba(2,6,23,0.30)] backdrop-blur-xl">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">Talep Havuzu</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Arama ve filtrelerle destek taleplerini hızlıca yönetin.
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[320px_160px_150px_150px]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-11 rounded-2xl border-white/10 bg-slate-900/70 pl-10"
                                placeholder="Ticket ara..."
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="h-11 rounded-2xl border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none"
                        >
                            <option value="ALL" className="bg-slate-950">
                                Tüm Durumlar
                            </option>
                            {statusOptions.map((item) => (
                                <option key={item} value={item} className="bg-slate-950">
                                    {statusLabels[item]}
                                </option>
                            ))}
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(event) => setPriorityFilter(event.target.value)}
                            className="h-11 rounded-2xl border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none"
                        >
                            <option value="ALL" className="bg-slate-950">
                                Öncelik
                            </option>
                            {priorityOptions.map((item) => (
                                <option key={item} value={item} className="bg-slate-950">
                                    {priorityLabels[item]}
                                </option>
                            ))}
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                            className="h-11 rounded-2xl border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none"
                        >
                            {categoryOptions.map((item) => (
                                <option key={item} value={item} className="bg-slate-950">
                                    {item === "ALL" ? "Kategori" : item}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-5">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-28 animate-pulse rounded-3xl border border-white/10 bg-slate-900/60"
                                />
                            ))}
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/45 px-6 py-14 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                                <Filter className="h-8 w-8" />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-white">
                                Talep bulunamadı
                            </h3>

                            <p className="mt-2 text-sm text-slate-400">
                                Seçilen filtrelere uygun destek talebi yok.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTickets.map((ticket) => {
                                const resolution = resolutionById[ticket.id] ?? "";

                                return (
                                    <article
                                        key={ticket.id}
                                        className="rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.78),rgba(2,6,23,0.72))] p-4 shadow-[0_14px_40px_rgba(2,6,23,0.24)] transition hover:border-sky-400/35"
                                    >
                                        <div className="grid gap-4 xl:grid-cols-[1.1fr_270px_1fr_110px] xl:items-center">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <TicketBadge
                                                        type="status"
                                                        value={ticket.status}
                                                    />
                                                    <TicketBadge
                                                        type="priority"
                                                        value={ticket.priority}
                                                    />
                                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-slate-300">
                                                        {ticket.category}
                                                    </span>
                                                </div>

                                                <h3 className="mt-3 line-clamp-1 text-base font-bold text-white">
                                                    {ticket.title}
                                                </h3>

                                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">
                                                    {ticket.description}
                                                </p>

                                                <p className="mt-3 text-xs text-slate-500">
                                                    Oluşturulma: {formatDate(ticket.createdAt)}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                                                <p className="text-xs font-semibold text-slate-500">
                                                    Atama Durumu
                                                </p>

                                                {ticket.assignedTo ? (
                                                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                                                        <UserCheck className="h-4 w-4" />
                                                        Üstlenildi
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            claimTicketMutation.mutate(ticket.id)
                                                        }
                                                        disabled={claimTicketMutation.isPending}
                                                        className="mt-2 h-10 w-full rounded-2xl"
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                        Üstlen
                                                    </Button>
                                                )}
                                            </div>

                                            <div>
                                                {ticket.status === "RESOLVED" ? (
                                                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                                                        <p className="text-xs font-bold text-emerald-200">
                                                            Çözüm
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-sm text-emerald-50">
                                                            {ticket.resolution || "Çözüldü"}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <Input
                                                            value={resolution}
                                                            onChange={(event) =>
                                                                setResolutionById((prev) => ({
                                                                    ...prev,
                                                                    [ticket.id]:
                                                                    event.target.value,
                                                                }))
                                                            }
                                                            placeholder="Çözüm açıklaması"
                                                            className="h-11 rounded-2xl border-white/10 bg-slate-900/70"
                                                        />

                                                        <Button
                                                            type="button"
                                                            disabled={
                                                                !ticket.assignedTo ||
                                                                !resolution.trim() ||
                                                                updateStatusMutation.isPending
                                                            }
                                                            onClick={() =>
                                                                updateStatusMutation.mutate({
                                                                    id: ticket.id,
                                                                    payload: {
                                                                        statusId:
                                                                        STATUS_NAME_TO_ID.RESOLVED,
                                                                        resolution:
                                                                            resolution.trim(),
                                                                    },
                                                                })
                                                            }
                                                            className="h-11 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Çöz
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => setSelectedTicketId(ticket.id)}
                                                className="h-11 rounded-2xl"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Aç
                                            </Button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

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

export default AllTicketsPage;