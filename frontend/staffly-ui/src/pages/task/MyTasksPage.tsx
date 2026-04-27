import { useEffect, useState } from "react";
import { getMyTasks } from "../../services/taskService";

// ─── Tipler ───────────────────────────────────────────────────────────
type Priority = "LOW" | "MEDIUM" | "HIGH" | string;

type TaskResponse = {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status?: string;
  startDate?: string | null;
  dueDate?: string | null;
  assignerName?: string;
};

// ─── Yardımcılar ──────────────────────────────────────────────────────
const PRIORITY: Record<string, { label: string; pill: string; dot: string }> = {
  HIGH:   { label: "Yüksek", pill: "border-red-400/30 bg-red-500/10 text-red-300",       dot: "bg-red-400"     },
  MEDIUM: { label: "Orta",   pill: "border-amber-400/30 bg-amber-500/10 text-amber-300", dot: "bg-amber-400"   },
  LOW:    { label: "Düşük",  pill: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" },
};

const STATUS: Record<string, { label: string; pill: string }> = {
  PENDING:     { label: "Bekliyor",     pill: "border-slate-500/40 bg-slate-700/40 text-slate-300"       },
  IN_PROGRESS: { label: "Devam Ediyor", pill: "border-sky-400/30 bg-sky-500/10 text-sky-300"             },
  DONE:        { label: "Tamamlandı",   pill: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" },
  CANCELLED:   { label: "İptal Edildi", pill: "border-red-400/30 bg-red-500/10 text-red-300"             },
};

function priorityOf(p: string) {
  return PRIORITY[p] ?? { label: p, pill: "border-white/10 bg-white/5 text-slate-300", dot: "bg-slate-400" };
}
function statusOf(s?: string) {
  if (!s) return null;
  return STATUS[s] ?? { label: s, pill: "border-white/10 bg-white/5 text-slate-300" };
}
function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function isOverdue(dueDate?: string | null, status?: string) {
  if (!dueDate || status === "DONE" || status === "CANCELLED") return false;
  return new Date(dueDate) < new Date();
}

// ─── Inline SVG ikonlar ───────────────────────────────────────────────
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 15.5" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ─── TaskCard ──────────────────────────────────────────────────────────
function TaskCard({ task }: { task: TaskResponse }) {
  const pri     = priorityOf(task.priority);
  const sta     = statusOf(task.status);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="group rounded-2xl border border-white/10 bg-slate-900/45 p-5 transition
                    hover:border-sky-400/30 hover:bg-slate-900/60 hover:shadow-[0_0_28px_rgba(56,189,248,0.06)]">

      {/* Başlık + rozetler */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-white group-hover:text-sky-100 transition">
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${pri.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
            {pri.label}
          </span>
          {sta && (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${sta.pill}`}>
              {sta.label}
            </span>
          )}
        </div>
      </div>

      {/* Açıklama */}
      <p className="mt-2.5 text-sm leading-relaxed text-slate-300/80 line-clamp-3">
        {task.description}
      </p>

      {/* Alt bilgi */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
          Başlangıç: <span className="text-slate-200 ml-1">{formatDate(task.startDate)}</span>
        </span>
        <span className={`flex items-center gap-1 ${overdue ? "text-red-300" : ""}`}>
          <ClockIcon className={`w-3.5 h-3.5 ${overdue ? "text-red-400" : "text-slate-500"}`} />
          Bitiş:{" "}
          <span className={`ml-1 ${overdue ? "text-red-300 font-medium" : "text-slate-200"}`}>
            {formatDate(task.dueDate)}
            {overdue && " · Gecikti"}
          </span>
        </span>
        {task.assignerName && (
          <span className="flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            Atayan: <span className="text-slate-200 ml-1">{task.assignerName}</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Filtre tipleri ────────────────────────────────────────────────────
type StatusFilter   = "ALL" | "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
type PriorityFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

// ─── MyTasksPage ───────────────────────────────────────────────────────
const MyTasksPage = () => {
  const [tasks, setTasks]               = useState<TaskResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priFilter, setPriFilter]       = useState<PriorityFilter>("ALL");
  const [search, setSearch]             = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      try {
        setLoading(true);

        const res = await getMyTasks();
        const data = res.data?.content ?? res.data ?? [];

        if (isMounted) {
          setTasks(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setError("Görevler yüklenemedi. Lütfen tekrar deneyin.");
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrelenmiş liste
  const filtered = tasks.filter((t) => {
    if (statusFilter !== "ALL" && t.status   !== statusFilter) return false;
    if (priFilter    !== "ALL" && t.priority !== priFilter)    return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sayaçlar
  const counts = {
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === "PENDING").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    done:       tasks.filter(t => t.status === "DONE").length,
    overdue:    tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
  };

  const btn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
      active
        ? "bg-sky-500/20 border-sky-400/40 text-sky-200"
        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
    }`;

  return (
    <div className="px-3 py-6 text-white sm:px-6">

      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Görevlerim</h1>
        <p className="mt-1 text-sm text-slate-400">Size atanmış tüm görevleri buradan takip edebilirsiniz.</p>
      </div>

      {/* Özet kartlar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Toplam",       value: counts.total,      color: "text-white"       },
          { label: "Bekliyor",     value: counts.pending,    color: "text-slate-300"   },
          { label: "Devam Ediyor", value: counts.inProgress, color: "text-sky-300"     },
          { label: "Tamamlandı",   value: counts.done,       color: "text-emerald-300" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-slate-900/45 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Gecikmiş uyarısı */}
      {counts.overdue > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <span className="text-base">⚠️</span>
          <span>
            <span className="font-semibold">{counts.overdue} göreviniz</span> bitiş tarihini geçti.
          </span>
        </div>
      )}

      {/* Arama + Filtreler */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Görev ara…"
          className="w-full max-w-xs rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30"
        />

        {/* Durum */}
        <div className="flex flex-wrap gap-1.5">
          {(["ALL","PENDING","IN_PROGRESS","DONE","CANCELLED"] as StatusFilter[]).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} className={btn(statusFilter === f)}>
              {f === "ALL" ? "Tümü" : statusOf(f)?.label ?? f}
            </button>
          ))}
        </div>

        {/* Öncelik */}
        <div className="flex flex-wrap gap-1.5">
          {(["ALL","HIGH","MEDIUM","LOW"] as PriorityFilter[]).map(f => (
            <button key={f} onClick={() => setPriFilter(f)} className={btn(priFilter === f)}>
              {f === "ALL" ? "Tüm Öncelikler" : priorityOf(f).label}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
          <span className="inline-block w-5 h-5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          Görevler yükleniyor…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
          <span className="text-4xl">📋</span>
          <p className="text-sm">
            {tasks.length === 0
              ? "Henüz size atanmış bir görev bulunmuyor."
              : "Filtrelere uyan görev bulunamadı."}
          </p>
          {tasks.length > 0 && (
            <button
              onClick={() => { setStatusFilter("ALL"); setPriFilter("ALL"); setSearch(""); }}
              className="text-xs text-sky-400 hover:underline">
              Filtreleri temizle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;