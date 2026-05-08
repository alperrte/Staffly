import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TicketBadge } from "../../components/support/TicketBadge";
import { TicketDetailModal } from "../../components/support/TicketDetailModal";
import { Input } from "../../components/ui/input";
import { useAllTicketsQuery, useAssignTicketMutation, useUpdateTicketStatusMutation } from "../../hooks/useTickets";
import type { TicketPriority, TicketStatus } from "../../types/ticket";
import { getAllEmployees } from "../../services/employeeService";

const statusOptions: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED", "REJECTED"];
const priorityOptions: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const categoryOptions = ["ALL", "Technical", "Payroll", "Leave", "Onboarding", "Equipment", "Other"];

const STATUS_NAME_TO_ID: Record<TicketStatus, number> = {
    OPEN: 1,
    IN_PROGRESS: 2,
    WAITING_USER: 3,
    RESOLVED: 4,
    CLOSED: 5,
    REJECTED: 6,
};

const AllTicketsPage = () => {
    const { data: tickets, isLoading } = useAllTicketsQuery();
    const updateStatusMutation = useUpdateTicketStatusMutation();
    const assignTicketMutation = useAssignTicketMutation();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
    const [selectedTicketId, setSelectedTicketId] = useState<number>();
    const [employees, setEmployees] = useState<Array<{ id: number; firstName?: string; lastName?: string }>>([]);

    useEffect(() => {
        void (async () => {
            try {
                const data = await getAllEmployees();
                setEmployees(
                    data.map((e: any) => ({
                        id: e.id,
                        firstName: e.firstName,
                        lastName: e.lastName,
                    }))
                );
            } catch {
                setEmployees([]);
            }
        })();
    }, []);

    const filteredTickets = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (tickets ?? [])
            .filter((ticket) => {
                const matchesSearch =
                    q.length === 0 ||
                    ticket.title.toLowerCase().includes(q) ||
                    ticket.description.toLowerCase().includes(q);
                const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
                const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;
                const matchesCategory = categoryFilter === "ALL" || ticket.category === categoryFilter;
                return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
            })
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

    return (
        <div className="space-y-5 text-slate-100">
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/30 via-slate-900/55 to-slate-950/50 p-5">
                <h2 className="text-xl font-semibold">All Tickets Management</h2>
                <p className="mt-1 text-sm text-slate-300">
                    Admin/HR ekranında ticketları filtreleyin, durum ve atama işlemlerini hızlıca yönetin.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative xl:col-span-2">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                            placeholder="Search ticket..."
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400/70"
                    >
                        <option value="ALL">All Status</option>
                        {statusOptions.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400/70"
                        >
                            <option value="ALL">Priority</option>
                            {priorityOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400/70"
                        >
                            {categoryOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/45">
                <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr_70px] gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase text-slate-400 md:grid">
                    <span>Ticket</span>
                    <span>Status</span>
                    <span>Priority</span>
                    <span>Assign</span>
                    <span>Quick Action</span>
                    <span className="text-center">View</span>
                </div>

                {isLoading ? (
                    <p className="p-4 text-sm text-slate-300">Ticketlar yükleniyor...</p>
                ) : filteredTickets.length === 0 ? (
                    <p className="p-4 text-sm text-slate-400">Filtreye uygun ticket bulunamadı.</p>
                ) : (
                    <div className="divide-y divide-white/10">
                        {filteredTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="grid gap-3 px-4 py-3 transition hover:bg-slate-900/70 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr_70px] md:items-center"
                            >
                                <div>
                                    <p className="font-medium text-slate-100">{ticket.title}</p>
                                    <p className="line-clamp-1 text-xs text-slate-400">{ticket.description}</p>
                                </div>
                                <div>
                                    <TicketBadge type="status" value={ticket.status} />
                                </div>
                                <div>
                                    <TicketBadge type="priority" value={ticket.priority} />
                                </div>
                                <div>
                                    <select
                                        value={ticket.assignedTo ?? ""}
                                        onChange={(e) =>
                                            assignTicketMutation.mutate({
                                                id: ticket.id,
                                                payload: {
                                                    employeeId: e.target.value ? Number(e.target.value) : ticket.employeeId,
                                                },
                                            })
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-2.5 py-2 text-xs text-slate-100 outline-none"
                                    >
                                        <option value={ticket.employeeId}>Owner</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.firstName} {emp.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={ticket.status}
                                        onChange={(e) =>
                                            updateStatusMutation.mutate({
                                                id: ticket.id,
                                                payload: { statusId: STATUS_NAME_TO_ID[e.target.value as TicketStatus] },
                                            })
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-2.5 py-2 text-xs text-slate-100 outline-none"
                                    >
                                        {statusOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-2 text-xs text-slate-200 transition hover:border-sky-400/50"
                                >
                                    Open
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
