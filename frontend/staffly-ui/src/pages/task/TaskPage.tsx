import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAllTasks, updateStatus } from "../../services/taskService";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER, hasAnyRole } from "../../utils/auth";

type TaskResponse = {
  id: number;
  title: string;
  description: string;
  priority: string;
  startDate?: string | null;
  dueDate?: string | null;
  status?: string;
  statusId?: number;
  createdAt?: string;
  updatedAt?: string;
  assigneeEmployeeIds?: number[];
  assigneeEmails?: string[];
  assigneeNames?: string[];
  assignees?: Array<{
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    fullName?: string;
    name?: string;
  }>;
};

type SortDir = "asc" | "desc";
type SortKey = keyof TaskResponse | null;

/* ══ Helpers ════════════════════════════════════════════════════════ */
const priorityStyles: Record<string, string> = {
  LOW: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  HIGH: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const priorityLabelTR: Record<string, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

const statusStyles: Record<string, string> = {
  TODO: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  DONE: "bg-green-500/20 text-green-300 border border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const statusLabelTR: Record<string, string> = {
  TODO: "Yapılacak",
  IN_PROGRESS: "İşlemde",
  DONE: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

const emptyDash = (v: unknown) => {
  if (v == null) return "-";
  const s = String(v).trim();
  return s || "-";
};

const formatMaybeDateTR = (v: unknown) => {
  if (v == null) return "-";
  const s = String(v).trim();
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString("tr-TR");
};

function normalizeTaskStatus(raw: string | null | undefined): string {
  const s = String(raw ?? "").trim().toUpperCase();

  if (["1", "TODO", "PENDING", "NEW"].includes(s)) return "TODO";
  if (["2", "IN_PROGRESS", "STARTED", "ACTIVE"].includes(s)) return "IN_PROGRESS";
  if (["3", "DONE", "COMPLETED"].includes(s)) return "DONE";
  if (["4", "CANCELLED", "CANCELED"].includes(s)) return "CANCELLED";

  return "TODO";
}

/* ══ SortIcon ═══════════════════════════════════════════════════════ */
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
      <span className={`inline-flex flex-col ml-1.5 shrink-0 ${active ? "opacity-100" : "opacity-30"}`}>
      <svg
          className={`w-2 h-2 -mb-0.5 ${active && dir === "asc" ? "text-sky-400" : "text-slate-400"}`}
          viewBox="0 0 6 4"
          fill="currentColor"
      >
        <path d="M3 0L6 4H0z" />
      </svg>
      <svg
          className={`w-2 h-2 ${active && dir === "desc" ? "text-sky-400" : "text-slate-400"}`}
          viewBox="0 0 6 4"
          fill="currentColor"
      >
        <path d="M3 4L0 0h6z" />
      </svg>
    </span>
  );
}

/* ══ TaskPage ══════════════════════════════════════════════════════ */
const TaskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* Sort */
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* Expand */
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const canCreateTask = hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER, ROLE_MANAGER]);

  /* ── Loads ── */
  const loadTasks = () => {
    getAllTasks()
        .then((taskRes) => {
          const taskData = Array.isArray(taskRes)
              ? taskRes
              : taskRes?.content || [];
          setTasks(taskData);
        })
        .catch((err) => {
          console.error("TASK ERROR:", err);
          setError("Görevler yüklenemedi");
        })
        .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const state = location.state as
        | { taskCreated?: boolean; createdTaskTitle?: string }
        | null;

    if (state?.taskCreated) {
      const title = state.createdTaskTitle?.trim();
      setSuccessMessage(title ? `"${title}" başarıyla oluşturuldu.` : "Görev başarıyla oluşturuldu.");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChangeStatus = async (taskId: number, newStatus: string) => {
    try {
      setActionLoading(true);
      const statusMap: Record<string, number> = {
        TODO: 1,
        IN_PROGRESS: 2,
        DONE: 3,
        CANCELLED: 4,
      };
      await updateStatus(taskId, statusMap[newStatus]);
      await loadTasks();
    } catch (error) {
      console.error("Durum güncellenirken hata oluştu:", error);
      setError("Durum güncellerken hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Filter + Sort ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let list = q
        ? tasks.filter((task) =>
            Object.values(task)
                .map((v) => (v == null ? "" : String(v)))
                .join(" ")
                .toLowerCase()
                .includes(q)
        )
        : [...tasks];

    if (sortKey) {
      list.sort((a, b) => {
        const as = String(a[sortKey] ?? "").toLowerCase();
        const bs = String(b[sortKey] ?? "").toLowerCase();
        return sortDir === "asc" ? as.localeCompare(bs, "tr") : bs.localeCompare(as, "tr");
      });
    }

    return list;
  }, [search, tasks, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (loading) return <div className="text-slate-400 p-6">Görevler yükleniyor...</div>;

  const getAssigneeDetailLines = (task: TaskResponse): string[] => {
    if (Array.isArray(task.assigneeEmails) && task.assigneeEmails.length > 0) {
      return task.assigneeEmails;
    }

    if (Array.isArray(task.assigneeNames) && task.assigneeNames.length > 0) {
      return task.assigneeNames;
    }

    return [];
  };

  /* ── Th helper ── */
  const Th = ({
                children,
                sk,
                right,
              }: {
    children: ReactNode;
    sk?: SortKey;
    right?: boolean;
  }) => (
      <th
          onClick={() => sk && handleSort(sk)}
          className={`p-3 text-left whitespace-nowrap select-none
          ${sk ? "cursor-pointer hover:text-sky-300 transition-colors" : ""}
          ${right ? "text-right" : ""}`}
      >
      <span className="inline-flex items-center">
        {children}
        {sk && <SortIcon active={sortKey === sk} dir={sortDir} />}
      </span>
      </th>
  );

  return (
      <div className="w-full flex flex-col gap-6 px-3 sm:px-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold">Görevler</h1>
          <div className="flex gap-3 items-center">
            {canCreateTask && (
              <button
                  onClick={() => navigate("/app/tasks/create")}
                  className="bg-sky-500 hover:bg-sky-400 px-5 py-2 rounded-lg text-sm font-semibold text-white transition shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                + Görev Ekle
              </button>
            )}
            <input
                type="text"
                placeholder="Ara..."
                className="w-[260px] max-w-full rounded-lg bg-slate-900/50 border border-slate-700 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
        )}
        {successMessage && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              ✓ {successMessage}
            </div>
        )}

        {/* ── Table ── */}
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1240px]">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <Th sk="title">Başlık</Th>
                <Th sk="priority">Öncelik</Th>
                <Th sk="status">Durum</Th>
                <Th sk="startDate">Başlangıç</Th>
                <Th sk="dueDate">Bitiş</Th>
              </tr>
              </thead>

              <tbody>
              {filtered.map((task) => {
                const isOpen = expandedId === task.id;

                return (
                    <Fragment key={task.id}>
                      {/* ── Main row ── */}
                      <tr
                          onClick={() => setExpandedId((p) => (p === task.id ? null : task.id))}
                          className="border-t border-slate-700/70 transition cursor-pointer hover:bg-slate-800/30"
                      >
                        <td className="p-3 font-medium text-slate-200">
                        <span className="flex items-center gap-1.5">
                          {task.title}
                          <span className="text-slate-600 text-xs">{isOpen ? "▾" : "▸"}</span>
                        </span>
                        </td>
                        <td className="p-3">
                        <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                priorityStyles[task.priority] ?? ""
                            }`}
                        >
                          {priorityLabelTR[task.priority] ?? task.priority}
                        </span>
                        </td>
                        <td className="p-3">
                        <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                statusStyles[normalizeTaskStatus(task.status || String(task.statusId))] ?? ""
                            }`}
                        >
                          {statusLabelTR[normalizeTaskStatus(task.status || String(task.statusId))]}
                        </span>
                        </td>
                        <td className="p-3 text-slate-300 text-xs">
                          {formatMaybeDateTR(task.startDate)}
                        </td>
                        <td className="p-3 text-slate-300 text-xs">
                          {formatMaybeDateTR(task.dueDate)}
                        </td>
                      </tr>

                      {/* ══ EXPAND PANEL ════════════════════════════════════════ */}
                      {isOpen && (
                          <tr>
                            <td colSpan={5} className="border-t border-slate-700/50 bg-slate-900/25 p-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Başlık</div>
                                  <div className="text-sm text-slate-200 font-medium">{task.title}</div>
                                </div>

                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Açıklama</div>
                                  <div className="text-sm text-slate-200 font-medium break-words">
                                    {emptyDash(task.description)}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Öncelik</div>
                                  <div className="text-sm text-slate-200 font-medium">
                                    {priorityLabelTR[task.priority] ?? task.priority}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Durum</div>
                                  <div className="text-sm text-slate-200 font-medium">
                                    {statusLabelTR[normalizeTaskStatus(task.status || String(task.statusId))]}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Başlangıç Tarihi</div>
                                  <div className="text-sm text-slate-200 font-medium">
                                    {formatMaybeDateTR(task.startDate)}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Bitiş Tarihi</div>
                                  <div className="text-sm text-slate-200 font-medium">
                                    {formatMaybeDateTR(task.dueDate)}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Oluşturma Tarihi</div>
                                  <div className="text-sm text-slate-200 font-medium">
                                    {formatMaybeDateTR(task.createdAt)}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                  <div className="text-[10px] text-slate-500 mb-1">Güncellenme Tarihi</div>
                                  <div className="text-sm text-slate-200 font-medium">
                                    {formatMaybeDateTR(task.updatedAt)}
                                  </div>
                                </div>

                                {getAssigneeDetailLines(task).length > 0 && (
                                    <div className="sm:col-span-2 lg:col-span-2 rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2.5">
                                      <div className="text-[10px] text-slate-500 mb-1">Atananlar</div>
                                      <div className="text-sm text-slate-200 font-medium break-words">
                                        {getAssigneeDetailLines(task).join(", ")}
                                      </div>
                                    </div>
                                )}
                              </div>

                              <div className="mt-4 border-t border-slate-700/50 pt-4">
                                <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide font-semibold">İşlemler</div>
                                <div className="flex flex-wrap gap-2">
                                  {normalizeTaskStatus(task.status || String(task.statusId)) !== "CANCELLED" && (
                                      <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleChangeStatus(task.id, "CANCELLED");
                                          }}
                                          disabled={actionLoading}
                                          className="rounded-lg border border-red-600 bg-red-700/30 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-600/40 disabled:opacity-50"
                                      >
                                        {actionLoading ? "Güncelleniyor..." : "İptal Et"}
                                      </button>
                                  )}
                                  {normalizeTaskStatus(task.status || String(task.statusId)) === "CANCELLED" && (
                                      <span className="text-xs text-red-300 px-3 py-1.5">İptal Edildi</span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                      )}
                    </Fragment>
                );
              })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                {search ? `"${search}" için sonuç bulunamadı` : "Henüz görev yok"}
              </div>
          )}
        </div>
      </div>
  );
};

export default TaskPage;
