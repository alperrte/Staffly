import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ListChecks,
  Plus,
  Search,
  TimerReset,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

import { getAllTasks, updateStatus } from "../../services/taskService";
import { getAllEmployees } from "../../services/employeeService";
import {
  ROLE_SYSTEM_ADMIN,
  ROLE_HR_MANAGER,
  ROLE_DEPARTMENT_MANAGER,
  ROLE_MANAGER,
  hasAnyRole,
} from "../../utils/auth";
import type { NormalizedEmployee } from "../../types/employeeTypes";

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

const priorityStyles: Record<string, string> = {
  LOW: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  MEDIUM: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  HIGH: "border-rose-400/30 bg-rose-500/15 text-rose-300",
};

const priorityLabelTR: Record<string, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

const statusStyles: Record<string, string> = {
  TODO: "border-slate-400/25 bg-slate-500/15 text-slate-300",
  IN_PROGRESS: "border-sky-400/30 bg-sky-500/15 text-sky-300",
  DONE: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  CANCELLED: "border-rose-400/30 bg-rose-500/15 text-rose-300",
};

const statusLabelTR: Record<string, string> = {
  TODO: "Yapılacak",
  IN_PROGRESS: "İşlemde",
  DONE: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

const panelClass =
    "rounded-[26px] border border-white/10 bg-slate-950/45 shadow-[0_0_34px_rgba(15,23,42,0.35)]";

const emptyDash = (value: unknown) => {
  if (value == null) return "-";
  const text = String(value).trim();
  return text || "-";
};

const formatMaybeDateTR = (value: unknown) => {
  if (value == null) return "-";

  const text = String(value).trim();
  if (!text) return "-";

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toLocaleString("tr-TR");
};

function normalizeTaskStatus(raw: string | null | undefined): string {
  const status = String(raw ?? "").trim().toUpperCase();

  if (["1", "TODO", "PENDING", "NEW"].includes(status)) return "TODO";
  if (["2", "IN_PROGRESS", "STARTED", "ACTIVE"].includes(status)) return "IN_PROGRESS";
  if (["3", "DONE", "COMPLETED"].includes(status)) return "DONE";
  if (["4", "CANCELLED", "CANCELED"].includes(status)) return "CANCELLED";

  return "TODO";
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
      <span className={`ml-1.5 inline-flex shrink-0 flex-col ${active ? "opacity-100" : "opacity-30"}`}>
      <svg
          className={`h-2 w-2 -mb-0.5 ${
              active && dir === "asc" ? "text-sky-400" : "text-slate-400"
          }`}
          viewBox="0 0 6 4"
          fill="currentColor"
      >
        <path d="M3 0L6 4H0z" />
      </svg>

      <svg
          className={`h-2 w-2 ${
              active && dir === "desc" ? "text-sky-400" : "text-slate-400"
          }`}
          viewBox="0 0 6 4"
          fill="currentColor"
      >
        <path d="M3 4L0 0h6z" />
      </svg>
    </span>
  );
}

const TaskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canCreateTask = hasAnyRole([
    ROLE_SYSTEM_ADMIN,
    ROLE_HR_MANAGER,
    ROLE_DEPARTMENT_MANAGER,
    ROLE_MANAGER,
  ]);

  const loadTasks = () => {
    setLoading(true);

    Promise.all([getAllTasks(), getAllEmployees().catch(() => [])])
        .then(([taskRes, employeeRows]) => {
          const taskData = Array.isArray(taskRes) ? taskRes : taskRes?.content || [];

          setTasks(taskData);
          setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
        })
        .catch((err) => {
          console.error("TASK ERROR:", err);
          setError("Görevler yüklenemedi.");
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

      setSuccessMessage(
          title ? `"${title}" başarıyla oluşturuldu.` : "Görev başarıyla oluşturuldu."
      );

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
    } catch (updateError) {
      console.error("Durum güncellenirken hata oluştu:", updateError);
      setError("Durum güncellerken hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const getAssigneeDetailLines = (task: TaskResponse): string[] => {
    if (Array.isArray(task.assigneeEmployeeIds) && task.assigneeEmployeeIds.length > 0) {
      const employeeNames = task.assigneeEmployeeIds
          .map((employeeId) => employees.find((employee) => employee.id === employeeId))
          .filter((employee): employee is NormalizedEmployee => Boolean(employee))
          .map(
              (employee) =>
                  employee.basicInfo?.fullName ||
                  `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
                  employee.email
          )
          .filter(Boolean);

      if (employeeNames.length > 0) {
        return employeeNames;
      }
    }

    if (Array.isArray(task.assigneeEmails) && task.assigneeEmails.length > 0) {
      return task.assigneeEmails;
    }

    if (Array.isArray(task.assigneeNames) && task.assigneeNames.length > 0) {
      return task.assigneeNames;
    }

    return [];
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    const list = query
        ? tasks.filter((task) => {
          const assignees = getAssigneeDetailLines(task).join(" ");

          return [
            task.title,
            task.description,
            task.priority,
            task.status,
            task.statusId,
            task.startDate,
            task.dueDate,
            assignees,
          ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query);
        })
        : [...tasks];

    if (sortKey) {
      list.sort((a, b) => {
        const first = String(a[sortKey] ?? "").toLowerCase();
        const second = String(b[sortKey] ?? "").toLowerCase();

        return sortDir === "asc"
            ? first.localeCompare(second, "tr")
            : second.localeCompare(first, "tr");
      });
    }

    return list;
  }, [search, tasks, sortKey, sortDir, employees]);

  const stats = useMemo(() => {
    const total = tasks.length;

    const todo = tasks.filter(
        (task) => normalizeTaskStatus(task.status || String(task.statusId)) === "TODO"
    ).length;

    const inProgress = tasks.filter(
        (task) => normalizeTaskStatus(task.status || String(task.statusId)) === "IN_PROGRESS"
    ).length;

    const done = tasks.filter(
        (task) => normalizeTaskStatus(task.status || String(task.statusId)) === "DONE"
    ).length;

    return { total, todo, inProgress, done };
  }, [tasks]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

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
          className={`select-none px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-400 ${
              sk ? "cursor-pointer transition hover:text-sky-300" : ""
          } ${right ? "text-right" : ""}`}
      >
      <span className={`inline-flex items-center ${right ? "justify-end" : ""}`}>
        {children}
        {sk && <SortIcon active={sortKey === sk} dir={sortDir} />}
      </span>
      </th>
  );

  if (loading) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
          Görevler yükleniyor...
        </div>
    );
  }

  return (
      <div className="min-h-full w-full px-5 py-5 text-slate-100 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                Task Management
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Görevler
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Atanan görevleri takip edin, durumlarını kontrol edin ve detaylarını görüntüleyin.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:items-center">
              <div className="relative w-full sm:w-[320px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                    type="text"
                    placeholder="Görev, kişi veya durum ara..."
                    className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/25"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {canCreateTask && (
                  <button
                      type="button"
                      onClick={() => navigate("/app/tasks/create")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 text-sm font-bold text-white shadow-[0_0_24px_rgba(56,189,248,0.22)] transition hover:bg-sky-400"
                  >
                    <Plus className="h-4 w-4" />
                    Görev Ekle
                  </button>
              )}
            </div>
          </div>

          {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
          )}

          {successMessage && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                ✓ {successMessage}
              </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TaskStatCard
                title="Toplam Görev"
                value={stats.total}
                description="Sistemdeki tüm görevler"
                color="blue"
                icon={<ClipboardList className="h-8 w-8" />}
            />

            <TaskStatCard
                title="Yapılacak"
                value={stats.todo}
                description="Henüz başlanmamış görevler"
                color="amber"
                icon={<ListChecks className="h-8 w-8" />}
            />

            <TaskStatCard
                title="İşlemde"
                value={stats.inProgress}
                description="Devam eden görevler"
                color="blue"
                icon={<TimerReset className="h-8 w-8" />}
            />

            <TaskStatCard
                title="Tamamlanan"
                value={stats.done}
                description="Bitirilen görevler"
                color="emerald"
                icon={<CheckCircle2 className="h-8 w-8" />}
            />
          </div>

          <section className={`${panelClass} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Görev Listesi</h2>

                <p className="mt-1 text-sm text-slate-400">
                  {filtered.length} görev listeleniyor.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] table-fixed text-sm">
                <thead className="bg-slate-900/75">
                <tr>
                  <Th sk="title">Başlık</Th>
                  <Th sk="description">Görev</Th>
                  <Th>Atanan</Th>
                  <Th sk="priority">Öncelik</Th>
                  <Th sk="status">Durum</Th>
                  <Th sk="startDate">Başlangıç</Th>
                  <Th sk="dueDate">Bitiş</Th>
                </tr>
                </thead>

                <tbody>
                {filtered.map((task) => {
                  const isOpen = expandedId === task.id;

                  const normalizedStatus = normalizeTaskStatus(
                      task.status || String(task.statusId)
                  );

                  const assignees = getAssigneeDetailLines(task);

                  return (
                      <Fragment key={task.id}>
                        <tr
                            onClick={() =>
                                setExpandedId((current) =>
                                    current === task.id ? null : task.id
                                )
                            }
                            className="cursor-pointer border-t border-white/10 transition hover:bg-sky-500/[0.04]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300">
                              {isOpen ? (
                                  <ChevronDown className="h-4 w-4" />
                              ) : (
                                  <ChevronRight className="h-4 w-4" />
                              )}
                            </span>

                              <span className="truncate font-bold text-white">
                              {task.title}
                            </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                          <span className="block truncate">
                            {emptyDash(task.description)}
                          </span>
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            <div className="flex min-w-0 items-center gap-2">
                              <UserRoundCheck className="h-4 w-4 shrink-0 text-slate-500" />

                              <span className="truncate">
                              {assignees.join(", ") || "-"}
                            </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                          <span
                              className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-bold ${
                                  priorityStyles[task.priority] ?? ""
                              }`}
                          >
                            {priorityLabelTR[task.priority] ?? task.priority}
                          </span>
                          </td>

                          <td className="px-5 py-4">
                          <span
                              className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-bold ${
                                  statusStyles[normalizedStatus] ?? ""
                              }`}
                          >
                            {statusLabelTR[normalizedStatus]}
                          </span>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-slate-500" />
                              {formatMaybeDateTR(task.startDate)}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-slate-500" />
                              {formatMaybeDateTR(task.dueDate)}
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                            <tr>
                              <td
                                  colSpan={7}
                                  className="border-t border-white/10 bg-slate-950/45 px-5 py-5"
                              >
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                  <DetailCard title="Başlık" value={task.title} />

                                  <DetailCard
                                      title="Öncelik"
                                      value={priorityLabelTR[task.priority] ?? task.priority}
                                  />

                                  <DetailCard
                                      title="Durum"
                                      value={statusLabelTR[normalizedStatus]}
                                  />

                                  <DetailCard
                                      title="Başlangıç Tarihi"
                                      value={formatMaybeDateTR(task.startDate)}
                                  />

                                  <DetailCard
                                      title="Bitiş Tarihi"
                                      value={formatMaybeDateTR(task.dueDate)}
                                  />

                                  <DetailCard
                                      title="Oluşturma Tarihi"
                                      value={formatMaybeDateTR(task.createdAt)}
                                  />

                                  <DetailCard
                                      title="Güncellenme Tarihi"
                                      value={formatMaybeDateTR(task.updatedAt)}
                                  />

                                  <DetailCard
                                      title="Atananlar"
                                      value={assignees.join(", ") || "-"}
                                  />

                                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:col-span-2 xl:col-span-4">
                                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                      Açıklama
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                      {emptyDash(task.description)}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                                  <div>
                                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                      İşlemler
                                    </div>

                                    <p className="mt-1 text-sm text-slate-400">
                                      Görev durumunu buradan güncelleyebilirsiniz.
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {normalizedStatus !== "CANCELLED" ? (
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleChangeStatus(task.id, "CANCELLED");
                                            }}
                                            disabled={actionLoading}
                                            className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
                                        >
                                          <XCircle className="h-4 w-4" />

                                          {actionLoading ? "Güncelleniyor..." : "İptal Et"}
                                        </button>
                                    ) : (
                                        <span className="inline-flex rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200">
                                    İptal Edildi
                                  </span>
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
                <div className="p-10 text-center text-sm text-slate-500">
                  {search ? `"${search}" için sonuç bulunamadı.` : "Henüz görev yok."}
                </div>
            )}
          </section>
        </div>
      </div>
  );
};

function TaskStatCard({
                        title,
                        value,
                        description,
                        color,
                        icon,
                      }: {
  title: string;
  value: number;
  description: string;
  color: "blue" | "amber" | "rose" | "emerald";
  icon: ReactNode;
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
    rose: {
      card: "border-rose-400/25 bg-rose-500/10",
      icon: "bg-rose-500/15 text-rose-300 shadow-[0_0_32px_rgba(244,63,94,0.18)]",
      text: "text-rose-200",
      arrow: "bg-rose-500/15 text-rose-300",
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
      <div
          className={`rounded-2xl border p-5 text-left transition hover:border-white/20 hover:bg-white/[0.04] ${selected.card}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${selected.icon}`}
            >
              {icon}
            </div>

            <div className="min-w-0">
              <p className={`text-sm font-bold ${selected.text}`}>{title}</p>

              <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>

              <p className="mt-1 truncate text-sm text-slate-400">{description}</p>
            </div>
          </div>

          <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selected.arrow}`}
          >
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
  );
}

function DetailCard({ title, value }: { title: string; value: ReactNode }) {
  return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </div>

        <div className="mt-2 break-words text-sm font-semibold text-slate-200">
          {value}
        </div>
      </div>
  );
}

export default TaskPage;