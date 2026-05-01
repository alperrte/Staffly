import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
    CheckCircle2,
    Circle,
    Clock3,
    FileText,
    Search,
    X,
} from "lucide-react";
import { getMyTasks, updateStatus } from "../../services/taskService";

type TaskResponse = {
    id: number;
    title: string;
    description: string;
    priority?: string;
    status?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    assigneeEmployeeIds?: number[];
    assigneeNames?: string[];
};

type StatusFilter = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

type NormalizedStatus = StatusFilter;

const statusMap: Record<StatusFilter, string> = {
    TODO: "Yapılacak",
    IN_PROGRESS: "İşlemde",
    DONE: "Tamamlandı",
    CANCELLED: "İptal Edildi",
};

const priorityLabelTR: Record<string, string> = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
};

const priorityStyles: Record<string, string> = {
    LOW: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    HIGH: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const statusBadgeStyles: Record<StatusFilter, string> = {
    TODO: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    IN_PROGRESS: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    DONE: "bg-green-500/20 text-green-300 border border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-300 border border-red-500/30",
};

function normalizeTaskStatus(raw: string | null | undefined): NormalizedStatus {
    const s = String(raw ?? "").trim().toUpperCase();

    if (["TODO", "PENDING", "NEW", "OPEN"].includes(s)) return "TODO";
    if (["IN_PROGRESS", "STARTED", "ACTIVE", "WORKING"].includes(s)) return "IN_PROGRESS";
    if (["DONE", "COMPLETED", "CLOSED", "RESOLVED", "FINISHED"].includes(s)) return "DONE";
    if (["CANCELLED", "CANCELED", "VOID"].includes(s)) return "CANCELLED";
    return "TODO";
}

function formatMaybeDateTR(v: unknown) {
    if (v == null) return "-";
    const s = String(v).trim();
    if (!s) return "-";
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString("tr-TR");
}

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODO");
    const [viewTask, setViewTask] = useState<TaskResponse | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            setPageError("");

            // API, token'dan oturumdaki kullanıcıyı okuyup ona atanmış görevleri döndürmeli.
            const res = await getMyTasks();
            const list: TaskResponse[] = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
            setTasks(list);
        } catch (error) {
            console.error("Görevlerim alınamadı:", error);
            setPageError("Görevlerim yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const handleChangeStatus = async (taskId: number, newStatus: StatusFilter) => {
        try {
            setActionLoading(true);
            const statusMap = { TODO: 1, IN_PROGRESS: 2, DONE: 3, CANCELLED: 4 };
            await updateStatus(taskId, statusMap[newStatus]);

            // Görevleri yeniden yükle
            await fetchMyTasks();
            setViewTask(null);
        } catch (error) {
            console.error("Durum güncellenirken hata oluştu:", error);
            setPageError("Durum güncellenirken hata oluştu.");
        } finally {
            setActionLoading(false);
        }
    };

    const counters = useMemo(() => {
        const initial = { TODO: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 };
        for (const task of tasks) {
            const key = normalizeTaskStatus(task.status);
            initial[key] += 1;
        }
        return initial;
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return tasks.filter((task) => {
            if (normalizeTaskStatus(task.status) !== statusFilter) return false;

            if (!search) return true;

            return (
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                String(task.id).includes(search) ||
                (task.priority || "").toLowerCase().includes(search)
            );
        });
    }, [tasks, searchTerm, statusFilter]);

    const detailModal =
        viewTask &&
        createPortal(
            <div className="fixed inset-0 z-[9990] overflow-y-auto bg-black/80 backdrop-blur-sm">
                <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:px-6 sm:py-10">
                    <div className="my-auto flex w-full max-w-3xl max-h-[min(90vh,880px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_60px_rgba(2,6,23,0.9)]">
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                            <h2 className="text-lg font-semibold text-white">Görev detayı</h2>
                            <button
                                type="button"
                                onClick={() => setViewTask(null)}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                aria-label="Kapat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="staffly-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                            <div className="mb-3 flex flex-wrap gap-2">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusBadgeStyles[normalizeTaskStatus(viewTask.status)]
                    }`}
                >
                  {statusMap[normalizeTaskStatus(viewTask.status)]}
                </span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        priorityStyles[viewTask.priority || "LOW"] || "bg-slate-500/15 text-slate-300"
                                    }`}
                                >
                  Öncelik: {priorityLabelTR[viewTask.priority || ""] || viewTask.priority || "-"}
                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-white">{viewTask.title}</h3>
                            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                                {viewTask.description || "-"}
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Başlangıç</p>
                                    <p className="mt-1 text-sm text-white">{formatMaybeDateTR(viewTask.startDate)}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Bitiş</p>
                                    <p className="mt-1 text-sm text-white">{formatMaybeDateTR(viewTask.dueDate)}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Oluşturulma</p>
                                    <p className="mt-1 text-sm text-white">{formatMaybeDateTR(viewTask.createdAt)}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Güncellenme</p>
                                    <p className="mt-1 text-sm text-white">{formatMaybeDateTR(viewTask.updatedAt)}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-6">
                                {normalizeTaskStatus(viewTask.status) !== "TODO" && (
                                    <button
                                        type="button"
                                        onClick={() => handleChangeStatus(viewTask.id, "TODO")}
                                        disabled={actionLoading}
                                        className="rounded-lg border border-slate-600 bg-slate-700/30 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600/40 disabled:opacity-50"
                                    >
                                        {actionLoading ? "Güncelleniyor..." : "Yapılacak"}
                                    </button>
                                )}

                                {normalizeTaskStatus(viewTask.status) !== "IN_PROGRESS" && (
                                    <button
                                        type="button"
                                        onClick={() => handleChangeStatus(viewTask.id, "IN_PROGRESS")}
                                        disabled={actionLoading}
                                        className="rounded-lg border border-blue-600 bg-blue-700/30 px-4 py-2 text-sm font-medium text-blue-200 transition hover:bg-blue-600/40 disabled:opacity-50"
                                    >
                                        {actionLoading ? "Güncelleniyor..." : "İşleme Al"}
                                    </button>
                                )}

                                {normalizeTaskStatus(viewTask.status) !== "DONE" && (
                                    <button
                                        type="button"
                                        onClick={() => handleChangeStatus(viewTask.id, "DONE")}
                                        disabled={actionLoading}
                                        className="rounded-lg border border-green-600 bg-green-700/30 px-4 py-2 text-sm font-medium text-green-200 transition hover:bg-green-600/40 disabled:opacity-50"
                                    >
                                        {actionLoading ? "Güncelleniyor..." : "Tamamlandı"}
                                    </button>
                                )}

                                {normalizeTaskStatus(viewTask.status) !== "CANCELLED" && (
                                    <button
                                        type="button"
                                        onClick={() => handleChangeStatus(viewTask.id, "CANCELLED")}
                                        disabled={actionLoading}
                                        className="rounded-lg border border-red-600 bg-red-700/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-600/40 disabled:opacity-50"
                                    >
                                        {actionLoading ? "Güncelleniyor..." : "İptal Et"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );

    return (
        <>
            <div className="min-h-screen bg-[#020617] px-3 py-5 text-white sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-[92rem]">
                    <div className="mb-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                                    Görevlerim
                                </h1>
                                <p className="mt-1 text-sm text-slate-300">
                                    Sadece hesabınıza atanmış görevler listelenir.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                            <button
                                type="button"
                                onClick={() => setStatusFilter("TODO")}
                                className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                    statusFilter === "TODO"
                                        ? "border-slate-300 bg-slate-500/20 ring-1 ring-slate-300/40"
                                        : "border-slate-500/30 bg-slate-500/5 hover:border-slate-400/60 hover:bg-slate-500/10"
                                }`}
                            >
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Circle className="h-4 w-4" />
                                    Yapılacak
                                </div>
                                <p className="mt-2 text-2xl font-bold text-white">{counters.TODO}</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStatusFilter("IN_PROGRESS")}
                                className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                    statusFilter === "IN_PROGRESS"
                                        ? "border-blue-400 bg-blue-500/20 ring-1 ring-blue-400/40"
                                        : "border-blue-500/25 bg-blue-500/5 hover:border-blue-400/50 hover:bg-blue-500/10"
                                }`}
                            >
                                <div className="flex items-center gap-2 text-sm text-blue-200">
                                    <Clock3 className="h-4 w-4" />
                                    İşlemde
                                </div>
                                <p className="mt-2 text-2xl font-bold text-white">{counters.IN_PROGRESS}</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStatusFilter("DONE")}
                                className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                    statusFilter === "DONE"
                                        ? "border-green-400 bg-green-500/20 ring-1 ring-green-400/35"
                                        : "border-green-500/25 bg-green-500/5 hover:border-green-400/50 hover:bg-green-500/10"
                                }`}
                            >
                                <div className="flex items-center gap-2 text-sm text-green-200">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Tamamlandı
                                </div>
                                <p className="mt-2 text-2xl font-bold text-white">{counters.DONE}</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStatusFilter("CANCELLED")}
                                className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                    statusFilter === "CANCELLED"
                                        ? "border-red-400 bg-red-500/20 ring-1 ring-red-400/35"
                                        : "border-red-500/25 bg-red-500/5 hover:border-red-400/50 hover:bg-red-500/10"
                                }`}
                            >
                                <div className="flex items-center gap-2 text-sm text-red-200">
                                    <X className="h-4 w-4" />
                                    İptal Edildi
                                </div>
                                <p className="mt-2 text-2xl font-bold text-white">{counters.CANCELLED}</p>
                            </button>
                        </div>

                        <div className="relative mt-5">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Başlık, açıklama, id veya öncelik ile ara..."
                                className="h-[56px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                            Görünen liste: <span className="font-medium text-slate-300">{statusMap[statusFilter]}</span>
                        </p>
                    </div>

                    {pageError && (
                        <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                            {pageError}
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-10 text-center text-sm text-slate-400">
                            Görevlerim yükleniyor...
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/90 to-slate-900/50 p-14 text-center">
                            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                            <p className="text-sm text-slate-300">
                                {tasks.length === 0
                                    ? "Hesabınıza atanmış görev bulunmuyor."
                                    : "Bu statüde veya arama kriterine uygun görev yok."}
                            </p>
                        </div>
                    ) : (
                        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
                            {filteredTasks.map((task) => {
                                const normalizedStatus = normalizeTaskStatus(task.status);
                                return (
                                    <div
                                        key={task.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setViewTask(task)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                setViewTask(task);
                                            }
                                        }}
                                        className="cursor-pointer rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-slate-900/40 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] outline-none ring-0 transition hover:border-sky-500/35 hover:shadow-[0_24px_60px_rgba(56,189,248,0.12)] focus-visible:ring-2 focus-visible:ring-sky-500/40"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeStyles[normalizedStatus]}`}
                          >
                            {statusMap[normalizedStatus]}
                          </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            priorityStyles[task.priority || "LOW"] || "bg-slate-500/15 text-slate-300"
                                                        }`}
                                                    >
                            Öncelik: {priorityLabelTR[task.priority || ""] || task.priority || "-"}
                          </span>
                                                </div>

                                                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{task.title}</h2>

                                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                                                    <span>Görev No: #{task.id}</span>
                                                    <span>Başlangıç: {formatMaybeDateTR(task.startDate)}</span>
                                                    <span>Bitiş: {formatMaybeDateTR(task.dueDate)}</span>
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                        Detay için tıklayın
                      </span>
                                        </div>

                                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-300">{task.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {detailModal}
        </>
    );
}
