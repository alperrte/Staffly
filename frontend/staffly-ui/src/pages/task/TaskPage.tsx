import { useEffect, useState } from "react";
import { getMyTasks, createTask, assignTask } from "../../services/taskService";
import { getEmployees } from "../../services/employeeService";
import axios from "axios";

const TaskPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "LOW",
    startDate: "",
    dueDate: "",
  });

  // TASKS LOAD
  const loadTasks = () => {
    getMyTasks()
      .then((res) => {
        console.log("TASKS:", res.data);
        setTasks(res.data.content || res.data || []);
      })
      .catch((err) => console.error("TASK ERROR:", err));
  };

  // EMPLOYEES LOAD
  const loadEmployees = () => {
    getEmployees()
      .then((list) => {
        console.log("EMPLOYEES:", list);
        setEmployees(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("EMPLOYEE ERROR:", err));
  };

  useEffect(() => {
    loadTasks();
    loadEmployees();
  }, []);

  // CREATE TASK
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
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        title,
        description,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };

      const res = await createTask(payload);
      const taskId = res.data.id;

      // 🔥 employee seçildiyse assign et
      if (selectedEmployee) {
        await assignTask(taskId, selectedEmployee);
      }

      // reset
      setForm({
        title: "",
        description: "",
        priority: "LOW",
        startDate: "",
        dueDate: "",
      });
      setSelectedEmployee(null);
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
  const selectClass = `${inputClass} appearance-none bg-[linear-gradient(45deg,transparent_50%,#94a3b8_50%),linear-gradient(135deg,#94a3b8_50%,transparent_50%)] bg-[position:calc(100%-18px)_50%,calc(100%-12px)_50%] bg-[size:6px_6px,6px_6px] bg-no-repeat pr-10`;
  const optionClass = "bg-slate-900 text-slate-100";
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="px-3 py-6 text-white sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold">Görevler</h1>

      {/* CREATE */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/45 p-6 shadow-[0_0_45px_rgba(15,23,42,0.7)]">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Yeni Görev</h2>
          <p className="mt-1 text-sm text-slate-400">
            Başlık ve açıklama zorunludur. İstersen görevi bir çalışana atayabilirsin.
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
          <div className="md:col-span-2">
            <label className={labelClass}>Başlık *</label>
            <input
              placeholder="Örn: Dashboard hata düzeltmesi"
              value={form.title}
              className={`${inputClass} ${titleError ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20" : ""}`}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {titleError && (
              <p className="mt-1.5 text-xs text-red-300">Başlık zorunludur.</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Açıklama *</label>
            <textarea
              placeholder="Görev detaylarını yaz..."
              value={form.description}
              rows={4}
              className={`${inputClass} resize-y ${descriptionError ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20" : ""}`}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            {descriptionError && (
              <p className="mt-1.5 text-xs text-red-300">Açıklama zorunludur.</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Öncelik</label>
            <select
              value={form.priority}
              className={selectClass}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
            >
              <option className={optionClass} value="LOW">Düşük</option>
              <option className={optionClass} value="MEDIUM">Orta</option>
              <option className={optionClass} value="HIGH">Yüksek</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Başlangıç Tarihi</label>
            <input
              type="datetime-local"
              value={form.startDate}
              min={nowLocal}
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className={labelClass}>Bitiş Tarihi</label>
            <input
              type="datetime-local"
              value={form.dueDate}
              min={form.startDate || nowLocal}
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, dueDate: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Atanacak Çalışan</label>
            <select
              value={selectedEmployee ?? ""}
              className={selectClass}
              onChange={(e) =>
                setSelectedEmployee(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option className={optionClass} value="">Çalışan seç (opsiyonel)</option>
              {employees?.map((emp: any) => (
                <option className={optionClass} key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-xs text-slate-400">* Zorunlu alanlar</p>
          <button
            onClick={handleCreateTask}
            disabled={isCreateDisabled}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/50"
          >
            Görev Oluştur
          </button>
        </div>
      </div>

      {/* TASK LIST */}
      {tasks.length === 0 ? (
        <p className="text-slate-400">Görev bulunamadı</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-white/10 bg-slate-900/45 p-4 transition hover:border-sky-400/35 hover:bg-slate-900/60">
            <h3 className="font-semibold">{task.title}</h3>
            <p className="mt-1 text-slate-200/90">{task.description}</p>
            <p className="mt-2 text-sm text-slate-400">
              Öncelik:{" "}
              <span className="font-medium text-slate-200">
                {task.priority === "LOW"
                  ? "Düşük"
                  : task.priority === "MEDIUM"
                    ? "Orta"
                    : task.priority === "HIGH"
                      ? "Yüksek"
                      : task.priority}
              </span>
            </p>
            <p className="text-sm text-slate-400">
              Başlangıç:{" "}
              {task.startDate
                ? new Date(task.startDate).toLocaleString("tr-TR")
                : "-"}
            </p>
            <p className="text-sm text-slate-400">
              Bitiş:{" "}
              {task.dueDate
                ? new Date(task.dueDate).toLocaleString("tr-TR")
                : "-"}
            </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskPage;