import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
    ArrowRight,
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
    priority: string;

    status?: string;
    statusId?: number;

    startDate?: string | null;
    dueDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
    assigneeEmployeeIds?: number[];
    assigneeEmails?: string[];
};

type StatusFilter = "ALL" | "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

type NormalizedStatus = Exclude<StatusFilter, "ALL">;

type ConfirmAction =
    | {
    type: "IN_PROGRESS" | "DONE";
    task: TaskResponse;
}
    | null;

const statusMap: Record<StatusFilter, string> = {
    ALL: "Tümü",
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
    ALL: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    TODO: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    IN_PROGRESS: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    DONE: "bg-green-500/20 text-green-300 border border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-300 border border-red-500/30",
};

function normalizeTaskStatus(raw: string | null | undefined): NormalizedStatus {
    const s = String(raw ?? "").trim().toUpperCase();

    if (["1", "TODO", "PENDING", "NEW", "OPEN"].includes(s)) return "TODO";
    if (["2", "IN_PROGRESS", "STARTED", "ACTIVE", "WORKING"].includes(s)) return "IN_PROGRESS";
    if (["3", "DONE", "COMPLETED", "CLOSED", "RESOLVED", "FINISHED"].includes(s)) return "DONE";
    if (["4", "CANCELLED", "CANCELED", "VOID"].includes(s)) return "CANCELLED";

    return "TODO";
}

function formatMaybeDateTR(value: unknown) {
    if (value == null) return "-";

    const text = String(value).trim();
    if (!text) return "-";

    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? text : date.toLocaleString("tr-TR");
}

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [viewTask, setViewTask] = useState<TaskResponse | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const fetchMyTasks = async (): Promise<TaskResponse[]> => {
        try {
            setLoading(true);
            setPageError("");

            const response = await getMyTasks();
            const list: TaskResponse[] = Array.isArray(response)
                ? response
                : response?.content ?? [];

            setTasks(list);
            return list;
        } catch (error) {
            console.error("Görevlerim alınamadı:", error);
            setPageError("Görevlerim yüklenirken hata oluştu.");
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const handleChangeStatus = async (
        taskId: number,
        newStatus: "IN_PROGRESS" | "DONE"
    ) => {
        try {
            setActionLoading(true);

            const statusIdMap: Record<"IN_PROGRESS" | "DONE", number> = {
                IN_PROGRESS: 2,
                DONE: 3,
            };

            await updateStatus(taskId, statusIdMap[newStatus]);

            const refreshedTasks = await fetchMyTasks();
            const updated = refreshedTasks.find((task) => task.id === taskId);

            if (updated) {
                setViewTask(updated);
            }

            setConfirmAction(null);
        } catch (error) {
            console.error("Durum güncellenirken hata oluştu:", error);
            setPageError("Durum güncellenirken hata oluştu.");
        } finally {
            setActionLoading(false);
        }
    };

    const counters = useMemo(() => {
        const initial = {
            TODO: 0,
            IN_PROGRESS: 0,
            DONE: 0,
            CANCELLED: 0,
        };

        for (const task of tasks) {
            const key = normalizeTaskStatus(task.status || String(task.statusId));
            initial[key] += 1;
        }

        return initial;
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return tasks.filter((task) => {
            const normalizedStatus = normalizeTaskStatus(task.status || String(task.statusId));

            if (statusFilter !== "ALL" && normalizedStatus !== statusFilter) {
                return false;
            }

            if (!search) return true;

            return (
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.priority || "").toLowerCase().includes(search) ||
                statusMap[normalizedStatus].toLowerCase().includes(search)
            );
        });
    }, [tasks, searchTerm, statusFilter]);

    const currentStatus = (viewTask
        ? normalizeTaskStatus(
            viewTask.statusId !== undefined ? String(viewTask.statusId) : viewTask.status
        )
        : "TODO") as StatusFilter;

    const closeConfirmModal = () => {
        if (actionLoading) return;
        setConfirmAction(null);
    };

    const confirmSelectedAction = async () => {
        if (!confirmAction) return;

        await handleChangeStatus(confirmAction.task.id, confirmAction.type);
    };

    const detailModal =
        viewTask &&
        createPortal(
            <div className="fixed inset-0 z-[9990] overflow-y-auto bg-black/80 backdrop-blur-sm">
                <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:px-6 sm:py-10">
                    <div className="my-auto flex max-h-[min(90vh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_60px_rgba(2,6,23,0.9)]">
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Görev Detayı
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Atanan görevin durumunu buradan güncelleyebilirsiniz.
                                </p>
                            </div>

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
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeStyles[currentStatus]}`}
                                >
                                    {statusMap[currentStatus]}
                                </span>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        priorityStyles[viewTask.priority || "LOW"] ||
                                        "bg-slate-500/15 text-slate-300"
                                    }`}
                                >
                                    Öncelik:{" "}
                                    {priorityLabelTR[viewTask.priority || ""] ||
                                        viewTask.priority ||
                                        "-"}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-white">
                                {viewTask.title}
                            </h3>

                            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                                {viewTask.description || "-"}
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Başlangıç</p>
                                    <p className="mt-1 text-sm text-white">
                                        {formatMaybeDateTR(viewTask.startDate)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Bitiş</p>
                                    <p className="mt-1 text-sm text-white">
                                        {formatMaybeDateTR(viewTask.dueDate)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Oluşturulma</p>
                                    <p className="mt-1 text-sm text-white">
                                        {formatMaybeDateTR(viewTask.createdAt)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Güncellenme</p>
                                    <p className="mt-1 text-sm text-white">
                                        {formatMaybeDateTR(viewTask.updatedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-slate-800 pt-6">
                                {currentStatus === "TODO" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmAction({
                                                type: "IN_PROGRESS",
                                                task: viewTask,
                                            })
                                        }
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/15 px-5 py-2.5 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        İşleme Al
                                    </button>
                                )}

                                {currentStatus === "IN_PROGRESS" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmAction({
                                                type: "DONE",
                                                task: viewTask,
                                            })
                                        }
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Tamamlandı Olarak İşaretle
                                    </button>
                                )}

                                {currentStatus === "DONE" && (
                                    <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                        Bu görev tamamlandı olarak işaretlenmiş.
                                    </p>
                                )}

                                {currentStatus === "CANCELLED" && (
                                    <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                        Bu görev iptal edilmiş.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );

    const confirmModal =
        confirmAction &&
        createPortal(
            <div
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
                onClick={closeConfirmModal}
            >
                <div
                    className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-[0_0_70px_rgba(2,6,23,0.95)]"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                                confirmAction.type === "DONE"
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-blue-500/15 text-blue-300"
                            }`}
                        >
                            {confirmAction.type === "DONE" ? (
                                <CheckCircle2 className="h-7 w-7" />
                            ) : (
                                <Clock3 className="h-7 w-7" />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={closeConfirmModal}
                            disabled={actionLoading}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-white">
                        {confirmAction.type === "DONE"
                            ? "Görevi Tamamla"
                            : "Görevi İşleme Al"}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        <span className="font-bold text-white">
                            {confirmAction.task.title}
                        </span>{" "}
                        görevini{" "}
                        {confirmAction.type === "DONE"
                            ? "tamamlandı olarak işaretlemek"
                            : "işleme almak"}{" "}
                        istediğinize emin misiniz?
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={closeConfirmModal}
                            disabled={actionLoading}
                            className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
                        >
                            Vazgeç
                        </button>

                        <button
                            type="button"
                            onClick={confirmSelectedAction}
                            disabled={actionLoading}
                            className={`rounded-2xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-60 ${
                                confirmAction.type === "DONE"
                                    ? "bg-emerald-600 hover:bg-emerald-500"
                                    : "bg-blue-600 hover:bg-blue-500"
                            }`}
                        >
                            {actionLoading
                                ? "İşleniyor..."
                                : confirmAction.type === "DONE"
                                    ? "Evet, Tamamla"
                                    : "Evet, İşleme Al"}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );

    return (
        <>
            <div className="min-h-screen w-full bg-[#020617] px-6 py-6 text-white sm:px-8">
                <div className="flex w-full flex-col gap-5">
                    <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/40 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                    Görevlerim
                                </h1>
                                <p className="mt-1 text-sm text-slate-300">
                                    Sadece hesabınıza atanmış görevler listelenir.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <TaskStatCard
                                title="Tümü"
                                value={tasks.length}
                                description="Hesabınıza atanmış tüm görevler"
                                color="blue"
                                icon={<FileText className="h-8 w-8" />}
                                active={statusFilter === "ALL"}
                                onClick={() => setStatusFilter("ALL")}
                            />

                            <TaskStatCard
                                title="Yapılacak"
                                value={counters.TODO}
                                description="Henüz başlanmamış görevler"
                                color="amber"
                                icon={<Circle className="h-8 w-8" />}
                                active={statusFilter === "TODO"}
                                onClick={() => setStatusFilter("TODO")}
                            />

                            <TaskStatCard
                                title="İşlemde"
                                value={counters.IN_PROGRESS}
                                description="Üzerinde çalışılan görevler"
                                color="blue"
                                icon={<Clock3 className="h-8 w-8" />}
                                active={statusFilter === "IN_PROGRESS"}
                                onClick={() => setStatusFilter("IN_PROGRESS")}
                            />

                            <TaskStatCard
                                title="Tamamlandı"
                                value={counters.DONE}
                                description="Tamamlanan görevler"
                                color="emerald"
                                icon={<CheckCircle2 className="h-8 w-8" />}
                                active={statusFilter === "DONE"}
                                onClick={() => setStatusFilter("DONE")}
                            />
                        </div>

                        <div className="relative mt-5">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Başlık, açıklama veya öncelik ile ara..."
                                className="h-[56px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                            Görünen liste:{" "}
                            <span className="font-medium text-slate-300">
                                {statusMap[statusFilter]}
                            </span>
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
                        <div className="grid w-full grid-cols-1 gap-5">
                            {filteredTasks.map((task) => {
                                const normalizedStatus = normalizeTaskStatus(
                                    task.status || String(task.statusId)
                                );

                                return (
                                    <div
                                        key={task.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setViewTask(task)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                setViewTask(task);
                                            }
                                        }}
                                        className="cursor-pointer rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-slate-900/40 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] outline-none ring-0 transition hover:border-sky-500/35 hover:shadow-[0_24px_60px_rgba(56,189,248,0.12)] focus-visible:ring-2 focus-visible:ring-sky-500/40"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeStyles[normalizedStatus]}`}
                                                    >
                                                        {statusMap[normalizedStatus]}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            priorityStyles[task.priority || "LOW"] ||
                                                            "bg-slate-500/15 text-slate-300"
                                                        }`}
                                                    >
                                                        Öncelik:{" "}
                                                        {priorityLabelTR[task.priority || ""] ||
                                                            task.priority ||
                                                            "-"}
                                                    </span>
                                                </div>

                                                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                                    {task.title}
                                                </h2>

                                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                                                    <span>
                                                        Başlangıç: {formatMaybeDateTR(task.startDate)}
                                                    </span>
                                                    <span>
                                                        Bitiş: {formatMaybeDateTR(task.dueDate)}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                                                Detay için tıklayın
                                            </span>
                                        </div>

                                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-300">
                                            {task.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {detailModal}
            {confirmModal}
        </>
    );
}

function TaskStatCard({
                          title,
                          value,
                          description,
                          color,
                          icon,
                          active,
                          onClick,
                      }: {
    title: string;
    value: number;
    description: string;
    color: "blue" | "amber" | "emerald";
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    const styles = {
        blue: {
            card: "border-blue-400/25 bg-blue-500/10",
            icon: "bg-blue-500/15 text-blue-300 shadow-[0_0_32px_rgba(37,99,235,0.28)]",
            text: "text-blue-200",
            arrow: "bg-blue-500/15 text-blue-300",
        },
        amber: {
            card: "border-amber-400/25 bg-amber-500/10",
            icon: "bg-amber-500/15 text-amber-300 shadow-[0_0_32px_rgba(245,158,11,0.18)]",
            text: "text-amber-200",
            arrow: "bg-amber-500/15 text-amber-300",
        },
        emerald: {
            card: "border-emerald-400/25 bg-emerald-500/10",
            icon: "bg-emerald-500/15 text-emerald-300 shadow-[0_0_32px_rgba(16,185,129,0.18)]",
            text: "text-emerald-200",
            arrow: "bg-emerald-500/15 text-emerald-300",
        },
    };

    const selected = styles[color];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border p-5 text-left transition ${
                selected.card
            } ${
                active
                    ? "ring-1 ring-white/20"
                    : "hover:border-white/20 hover:bg-white/[0.04]"
            }`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-5">
                    <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${selected.icon}`}
                    >
                        {icon}
                    </div>

                    <div className="min-w-0">
                        <p className={`text-sm font-bold ${selected.text}`}>
                            {title}
                        </p>

                        <p className="mt-1 text-3xl font-extrabold text-white">
                            {value}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selected.arrow}`}
                >
                    <ArrowRight className="h-5 w-5" />
                </div>
            </div>
        </button>
    );
}
