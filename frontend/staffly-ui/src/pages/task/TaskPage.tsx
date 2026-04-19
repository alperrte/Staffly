import { useEffect, useMemo, useRef, useState } from "react";
import { getMyTasks, createTask, assignTask } from "../../services/taskService";
import { getDepartments } from "../../services/departmentService";
import axios from "axios";

type DepartmentPositionResponse = { id: number; name: string; description?: string };
type SubDepartmentResponse = {
  id: number; name: string; description?: string;
  positions?: DepartmentPositionResponse[];
};
type DepartmentResponse = {
  id: number; name: string; description?: string;
  subDepartments?: SubDepartmentResponse[];
};
type DropdownOption = { value: string; label: string };

/* ══ MiniDropdown ══════════════════════════════════════════════════════ */
function MiniDropdown(props: {
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const { value, options, placeholder, onChange, disabled } = props;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition outline-none
          ${disabled
            ? "border-white/5 bg-slate-900/20 text-slate-600 cursor-not-allowed"
            : "border-white/10 bg-slate-900/45 text-white hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30"}`}
      >
        <span className={selected ? "text-white truncate" : "text-slate-400 truncate"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="text-slate-500 shrink-0 text-xs">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-xl border border-white/10 bg-slate-950 shadow-[0_8px_48px_rgba(0,0,0,0.8)]">
          <div className="p-1.5 max-h-56 overflow-y-auto">
            {options.length === 0 && <p className="px-3 py-2.5 text-sm text-slate-500">Seçenek yok</p>}
            {options.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                  ${opt.value === value ? "bg-sky-500/20 text-sky-100 font-medium" : "text-slate-200 hover:bg-sky-500/10"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ StepBadge ═════════════════════════════════════════════════════════ */
function StepBadge({ step, label, done }: { step: number; label: string; done: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${done ? "text-sky-400" : "text-slate-500"}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
        ${done ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"}`}>
        {done ? "✓" : step}
      </span>
      {label}
    </span>
  );
}

/* ══ TaskPage ══════════════════════════════════════════════════════════ */
const TaskPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Org seçimleri
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedSubDeptId, setSelectedSubDeptId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "LOW",
    startDate: "",
    dueDate: "",
  });

  /* ── Loads ── */
  const loadTasks = () => {
    getMyTasks()
      .then((res) => setTasks(res.data.content || res.data || []))
      .catch((err) => console.error("TASK ERROR:", err));
  };

  useEffect(() => {
    loadTasks();
    getDepartments()
      .then((data: unknown) => {
        const list: DepartmentResponse[] = Array.isArray(data) ? data : (data as any)?.content ?? [];
        setDepartments(list);
      })
      .catch(console.error);
  }, []);

  /* ── Cascade options ── */
  const deptOptions: DropdownOption[] = useMemo(
    () => departments.map(d => ({ value: String(d.id), label: d.name })),
    [departments]
  );

  const selectedDept = useMemo(
    () => departments.find(d => String(d.id) === selectedDeptId) ?? null,
    [departments, selectedDeptId]
  );

  const subDeptOptions: DropdownOption[] = useMemo(
    () => (selectedDept?.subDepartments ?? []).map(s => ({ value: String(s.id), label: s.name })),
    [selectedDept]
  );

  const selectedSubDept = useMemo(
    () => (selectedDept?.subDepartments ?? []).find(s => String(s.id) === selectedSubDeptId) ?? null,
    [selectedDept, selectedSubDeptId]
  );

  // Alt departmana ait çalışanlar — backend'in subDepartment üzerinden döndürdüğü employee listesi
  // Eğer backend'de subDept içinde employees alanı yoksa, getEmployees ile filtrele
  const employeeOptions: DropdownOption[] = useMemo(() => {
    const emps = (selectedSubDept as any)?.employees ?? [];
    return emps.map((e: any) => ({
      value: String(e.id),
      label: `${e.firstName} ${e.lastName}`,
    }));
  }, [selectedSubDept]);

  /* ── Handlers ── */
  const handleDeptChange = (v: string) => {
    setSelectedDeptId(v);
    setSelectedSubDeptId("");
    setSelectedEmployee(null);
  };

  const handleSubDeptChange = (v: string) => {
    setSelectedSubDeptId(v);
    setSelectedEmployee(null);
  };

  /* ── Create task ── */
  const handleCreateTask = async () => {
    setSubmitted(true);
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description) {
      setError("Başlık ve açıklama zorunludur.");
      setSuccess("");
      return;
    }
    try {
      setError("");
      setSuccess("");
      const payload = {
        ...form,
        title,
        description,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };
      const res = await createTask(payload);
      const taskId = res.data.id;
      if (selectedEmployee) await assignTask(taskId, selectedEmployee);

      setForm({ title: "", description: "", priority: "LOW", startDate: "", dueDate: "" });
      setSelectedDeptId("");
      setSelectedSubDeptId("");
      setSelectedEmployee(null);
      setSubmitted(false);
      setSuccess("Görev başarıyla oluşturuldu.");
      loadTasks();
    } catch (err: unknown) {
      console.error("CREATE TASK ERROR:", err);
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string })?.message ||
          (typeof err.response?.data === "string" ? err.response.data : "") ||
          `Görev oluşturulamadı (${err.response?.status ?? "hata"})`;
        setError(message);
        return;
      }
      setError("Görev oluşturulamadı");
    }
  };

  const titleError = submitted && !form.title.trim();
  const descriptionError = submitted && !form.description.trim();
  const isCreateDisabled = !form.title.trim() || !form.description.trim();

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 shadow-sm outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30";
  const labelClass = "mb-1.5 block text-xs font-medium tracking-wide text-slate-300";
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);

  return (
    <div className="px-3 py-6 text-white sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold">Görevler</h1>

      {/* ── CREATE ── */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/45 p-6 shadow-[0_0_45px_rgba(15,23,42,0.7)]">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Yeni Görev</h2>
          <p className="mt-1 text-sm text-slate-400">
            Görevi oluşturun ve isteğe bağlı olarak bir çalışana atayın.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Başlık — full width */}
          <div className="md:col-span-2">
            <label className={labelClass}>Başlık *</label>
            <input
              placeholder="Örn: Dashboard hata düzeltmesi"
              value={form.title}
              className={`${inputClass} ${titleError ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20" : ""}`}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {titleError && <p className="mt-1.5 text-xs text-red-300">Başlık zorunludur.</p>}
          </div>

          {/* Açıklama — full width */}
          <div className="md:col-span-2">
            <label className={labelClass}>Açıklama *</label>
            <textarea
              placeholder="Görev detaylarını yaz..."
              value={form.description}
              rows={3}
              className={`${inputClass} resize-y ${descriptionError ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20" : ""}`}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {descriptionError && <p className="mt-1.5 text-xs text-red-300">Açıklama zorunludur.</p>}
          </div>

          {/* Başlangıç & Bitiş — yan yana */}
          <div>
            <label className={labelClass}>Başlangıç Tarihi</label>
            <input type="datetime-local" value={form.startDate} min={nowLocal} className={inputClass}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Bitiş Tarihi</label>
            <input type="datetime-local" value={form.dueDate} min={form.startDate || nowLocal} className={inputClass}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>

          {/* ── Organizasyon başlığı ── */}
          <div className="md:col-span-2 mt-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Çalışan Ata</h3>
              <div className="flex items-center gap-3">
                <StepBadge step={1} label="Departman" done={!!selectedDeptId} />
                <span className="text-slate-700">›</span>
                <StepBadge step={2} label="Alt Departman" done={!!selectedSubDeptId} />
                <span className="text-slate-700">›</span>
                <StepBadge step={3} label="Çalışan" done={!!selectedEmployee} />
              </div>
            </div>
            <div className="h-px bg-slate-700/60" />
          </div>

          {/* Departman */}
          <div>
            <label className={labelClass}>Departman</label>
            <MiniDropdown
              value={selectedDeptId}
              options={deptOptions}
              placeholder="Departman seçin"
              onChange={handleDeptChange}
            />
          </div>

          {/* Alt Departman */}
          <div>
            <label className={labelClass}>
              Alt Departman
              {!selectedDeptId && <span className="ml-1 text-slate-600 font-normal">— önce departman seçin</span>}
            </label>
            <MiniDropdown
              value={selectedSubDeptId}
              options={subDeptOptions}
              placeholder={!selectedDeptId ? "Önce departman seçin" : subDeptOptions.length ? "Alt departman seçin" : "Alt departman bulunamadı"}
              disabled={!selectedDeptId || subDeptOptions.length === 0}
              onChange={handleSubDeptChange}
            />
          </div>

          {/* Çalışan */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              Çalışan
              {!selectedSubDeptId && <span className="ml-1 text-slate-600 font-normal">— önce alt departman seçin</span>}
            </label>
            <MiniDropdown
              value={selectedEmployee ? String(selectedEmployee) : ""}
              options={employeeOptions}
              placeholder={
                !selectedSubDeptId ? "Önce alt departman seçin"
                : employeeOptions.length === 0 ? "Bu departmanda çalışan bulunamadı"
                : "Çalışan seçin (opsiyonel)"
              }
              disabled={!selectedSubDeptId || employeeOptions.length === 0}
              onChange={v => setSelectedEmployee(v ? Number(v) : null)}
            />
          </div>

          {/* ── Alt çizgi + Öncelik ── */}
          <div className="md:col-span-2 mt-1">
            <div className="h-px bg-slate-700/60 mb-4" />
            <div className="md:w-1/2">
              <label className={labelClass}>Öncelik</label>
              <MiniDropdown
                value={form.priority}
                options={[
                  { value: "LOW", label: "Düşük" },
                  { value: "MEDIUM", label: "Orta" },
                  { value: "HIGH", label: "Yüksek" },
                ]}
                placeholder="Öncelik seçin"
                onChange={v => setForm({ ...form, priority: v })}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end border-t border-white/10 pt-4">
          <button
            onClick={handleCreateTask}
            disabled={isCreateDisabled}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/50"
          >
            Görev Oluştur
          </button>
        </div>
      </div>

      {/* ── TASK LIST ── */}
      {tasks.length === 0 ? (
        <p className="text-slate-400">Görev bulunamadı</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {tasks.map((task) => (
            <div key={task.id}
              className="rounded-xl border border-white/10 bg-slate-900/45 p-4 transition hover:border-sky-400/35 hover:bg-slate-900/60">
              <h3 className="font-semibold">{task.title}</h3>
              <p className="mt-1 text-slate-200/90">{task.description}</p>
              <p className="mt-2 text-sm text-slate-400">
                Öncelik:{" "}
                <span className="font-medium text-slate-200">
                  {task.priority === "LOW" ? "Düşük" : task.priority === "MEDIUM" ? "Orta" : task.priority === "HIGH" ? "Yüksek" : task.priority}
                </span>
              </p>
              <p className="text-sm text-slate-400">
                Başlangıç: {task.startDate ? new Date(task.startDate).toLocaleString("tr-TR") : "-"}
              </p>
              <p className="text-sm text-slate-400">
                Bitiş: {task.dueDate ? new Date(task.dueDate).toLocaleString("tr-TR") : "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskPage;