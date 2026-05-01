  import { useEffect, useMemo, useRef, useState } from "react";
  import { createTask, assignTask } from "../../services/taskService";
  import { getDepartments } from "../../services/departmentService";
  import { getAllEmployees } from "../../services/employeeService";
  import { useNavigate } from "react-router-dom";
  import type { ChangeEvent, FormEvent } from "react";
  import axios from "axios";

  type DepartmentPositionResponse = { id: number; name: string; description?: string };
  type SubDepartmentResponse = {
    id: number;
    name: string;
    description?: string;
    positions?: DepartmentPositionResponse[];
  };
  type DepartmentResponse = {
    id: number;
    name: string;
    description?: string;
    subDepartments?: SubDepartmentResponse[];
  };
  type DropdownOption = { value: string; label: string };
  type EmployeeResponse = {
    id: number;
    firstName?: string;
    lastName?: string;
    departmentId?: number | null;
    subDepartmentId?: number | null;
    positionId?: number | null;
    department?: { id?: number | null };
    subDepartment?: { id?: number | null };
    position?: { id?: number | null };
  };

  type CreateTaskForm = {
    title: string;
    description: string;
    priority: string;
    startDate: string;
    dueDate: string;
  };

  /* ══ DatePicker ════════════════════════════════════════════════════════ */
  function DatePicker(props: {
    value: string;
    onChange: (val: string) => void;
    max?: string;
    min?: string;
  }) {
    const { value, onChange, max, min } = props;
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const maxDate = max ? new Date(max + "T00:00:00") : null;
    const minDate = min ? new Date(min + "T00:00:00") : null;

    const parsed = value ? new Date(value + "T00:00:00") : null;
    const [viewYear, setViewYear] = useState(
        () => parsed?.getFullYear() ?? today.getFullYear()
    );
    const [viewMonth, setViewMonth] = useState(() => parsed?.getMonth() ?? today.getMonth());

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const monthNames = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    const dayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

    const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const toISO = (y: number, m: number, d: number) =>
        `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const isDayDisabled = (day: number) => {
      const d = new Date(viewYear, viewMonth, day);
      if (maxDate && d > maxDate) return true;
      if (minDate && d < minDate) return true;
      return false;
    };

    const isSelected = (day: number) =>
        parsed?.getFullYear() === viewYear &&
        parsed?.getMonth() === viewMonth &&
        parsed?.getDate() === day;

    const prevMonth = () =>
        viewMonth === 0 ? (setViewMonth(11), setViewYear((y) => y - 1)) : setViewMonth((m) => m - 1);

    const nextMonth = () =>
        viewMonth === 11 ? (setViewMonth(0), setViewYear((y) => y + 1)) : setViewMonth((m) => m + 1);

    const display = parsed
        ? `${String(parsed.getDate()).padStart(2, "0")}.${String(
            parsed.getMonth() + 1
        ).padStart(2, "0")}.${parsed.getFullYear()}`
        : "";

    const yearRange = Array.from({ length: 100 }, (_, i) => today.getFullYear() - i);

    return (
        <div ref={wrapperRef} className="relative">
          <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-left shadow-sm outline-none transition hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30 flex items-center justify-between gap-2"
          >
          <span className={display ? "text-white" : "text-slate-400"}>
            {display || "GG.AA.YYYY"}
          </span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          {open && (
              <div className="absolute left-0 z-30 mt-1.5 w-[17rem] rounded-2xl border border-white/10 bg-slate-950 shadow-[0_8px_48px_rgba(0,0,0,0.8)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition shrink-0"
                  >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1.5 flex-1 justify-center">
                    <select
                        value={viewMonth}
                        onChange={(e) => setViewMonth(Number(e.target.value))}
                        className="bg-slate-800/80 text-white text-xs rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer"
                    >
                      {monthNames.map((m, i) => (
                          <option key={i} value={i}>
                            {m}
                          </option>
                      ))}
                    </select>

                    <select
                        value={viewYear}
                        onChange={(e) => setViewYear(Number(e.target.value))}
                        className="bg-slate-800/80 text-white text-xs rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer"
                    >
                      {yearRange.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                      ))}
                    </select>
                  </div>

                  <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition shrink-0"
                  >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-0.5">
                  {dayNames.map((d) => (
                      <div key={d} className="text-center text-[10px] text-slate-600 py-1">
                        {d}
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-0.5">
                  {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const disabled = isDayDisabled(day);
                    const sel = isSelected(day);

                    return (
                        <button
                            key={`d-${day}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              onChange(toISO(viewYear, viewMonth, day));
                              setOpen(false);
                            }}
                            className={`text-center text-xs py-[7px] rounded-lg transition font-medium
                      ${sel ? "bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]" : ""}
                      ${!sel && !disabled ? "text-slate-300 hover:bg-sky-500/20 hover:text-sky-200" : ""}
                      ${disabled ? "text-slate-700 cursor-not-allowed" : "cursor-pointer"}
                    `}
                        >
                          {day}
                        </button>
                    );
                  })}
                </div>

                {value && (
                    <button
                        type="button"
                        onClick={() => {
                          onChange("");
                          setOpen(false);
                        }}
                        className="mt-3 w-full text-[11px] text-slate-500 hover:text-slate-300 transition text-center"
                    >
                      Temizle
                    </button>
                )}
              </div>
          )}
        </div>
    );
  }

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
      const h = (e: MouseEvent) => {
        if (!ref.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [open]);

    const selected = options.find((o) => o.value === value);

    return (
        <div ref={ref} className="relative">
          <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setOpen((v) => !v)}
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
                  {options.map((opt) => (
                      <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            onChange(opt.value);
                            setOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                    ${opt.value === value ? "bg-sky-500/20 text-sky-100 font-medium" : "text-slate-200 hover:bg-sky-500/10"}`}
                      >
                        {opt.label}
                      </button>
                  ))}
                </div>
              </div>
          )}
        </div>
    );
  }

  /* ══ MultiDropdown ═════════════════════════════════════════════════════ */
  function MultiDropdown(props: {
    values: string[];
    options: DropdownOption[];
    placeholder: string;
    onChange: (values: string[]) => void;
    disabled?: boolean;
  }) {
    const { values, options, placeholder, onChange, disabled } = props;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) return;
      const h = (e: MouseEvent) => {
        if (!ref.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [open]);

    const selectedLabels = useMemo(
        () => options.filter((o) => values.includes(o.value)).map((o) => o.label),
        [options, values]
    );

    const toggleValue = (value: string) => {
      if (values.includes(value)) onChange(values.filter((v) => v !== value));
      else onChange([...values, value]);
    };

    return (
        <div ref={ref} className="relative">
          <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition outline-none
            ${disabled
                  ? "border-white/5 bg-slate-900/20 text-slate-600 cursor-not-allowed"
                  : "border-white/10 bg-slate-900/45 text-white hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30"}`}
          >
          <span className={selectedLabels.length ? "text-white truncate" : "text-slate-400 truncate"}>
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
            <span className="text-slate-500 shrink-0 text-xs">{open ? "▴" : "▾"}</span>
          </button>
          {open && (
              <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-xl border border-white/10 bg-slate-950 shadow-[0_8px_48px_rgba(0,0,0,0.8)]">
                <div className="p-1.5 max-h-56 overflow-y-auto">
                  {options.length === 0 && <p className="px-3 py-2.5 text-sm text-slate-500">Seçenek yok</p>}
                  {options.map((opt) => {
                    const checked = values.includes(opt.value);
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleValue(opt.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2
                      ${checked ? "bg-sky-500/20 text-sky-100 font-medium" : "text-slate-200 hover:bg-sky-500/10"}`}
                        >
                    <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded border text-[10px]
                      ${checked ? "border-sky-300 bg-sky-400 text-slate-950" : "border-slate-500 text-transparent"}`}
                    >
                      ✓
                    </span>
                          <span className="truncate">{opt.label}</span>
                        </button>
                    );
                  })}
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
        <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
          ${done ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"}`}
        >
          {done ? "✓" : step}
        </span>
          {label}
      </span>
    );
  }

  /* ══ CreateTaskPage ════════════════════════════════════════════════════ */
  const CreateTaskPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<CreateTaskForm>({
      title: "",
      description: "",
      priority: "LOW",
      startDate: "",
      dueDate: "",
    });

    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [selectedDeptId, setSelectedDeptId] = useState("");
    const [selectedSubDeptId, setSelectedSubDeptId] = useState("");
    const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

    /* ── Loads ── */
    useEffect(() => {
      Promise.all([getDepartments(), getAllEmployees()])
          .then(([departmentData, employeeData]: [unknown, unknown]) => {
            const list: DepartmentResponse[] = Array.isArray(departmentData)
                ? departmentData
                : (departmentData as any)?.content ?? [];
            setDepartments(list);
            const empList: EmployeeResponse[] = Array.isArray(employeeData)
                ? employeeData
                : (employeeData as any)?.content ?? [];
            setEmployees(empList);
          })
          .catch(console.error);
    }, []);

    /* ── Cascade options ── */
    const deptOptions: DropdownOption[] = useMemo(
        () => departments.map((d) => ({ value: String(d.id), label: d.name })),
        [departments]
    );

    const selectedDept = useMemo(
        () => departments.find((d) => String(d.id) === selectedDeptId) ?? null,
        [departments, selectedDeptId]
    );

    const subDeptOptions: DropdownOption[] = useMemo(
        () => (selectedDept?.subDepartments ?? []).map((s) => ({ value: String(s.id), label: s.name })),
        [selectedDept]
    );

    const selectedSubDept = useMemo(
        () => (selectedDept?.subDepartments ?? []).find((s) => String(s.id) === selectedSubDeptId) ?? null,
        [selectedDept, selectedSubDeptId]
    );

    const positionOptions: DropdownOption[] = useMemo(
        () => (selectedSubDept?.positions ?? []).map((p) => ({ value: String(p.id), label: p.name })),
        [selectedSubDept]
    );

    const employeeOptions: DropdownOption[] = useMemo(() => {
      const deptId = selectedDeptId ? Number(selectedDeptId) : null;
      const subDeptId = selectedSubDeptId ? Number(selectedSubDeptId) : null;
      const positionIds = selectedPositionIds.map(Number);

      return employees
          .filter((emp) => {
            const rawDeptId = emp.departmentId ?? emp.department?.id ?? null;
            const rawSubDeptId = emp.subDepartmentId ?? emp.subDepartment?.id ?? null;
            const rawPositionId = emp.positionId ?? emp.position?.id ?? null;

            const employeePositionId = rawPositionId != null ? Number(rawPositionId) : null;
            let employeeDeptId = rawDeptId != null ? Number(rawDeptId) : null;
            let employeeSubDeptId = rawSubDeptId != null ? Number(rawSubDeptId) : null;

            if (employeePositionId != null && (employeeDeptId == null || employeeSubDeptId == null)) {
              for (const dept of departments) {
                for (const sub of dept.subDepartments ?? []) {
                  const hasPosition = (sub.positions ?? []).some((p) => Number(p.id) === employeePositionId);
                  if (hasPosition) {
                    if (employeeDeptId == null) employeeDeptId = Number(dept.id);
                    if (employeeSubDeptId == null) employeeSubDeptId = Number(sub.id);
                    break;
                  }
                }
                if (employeeDeptId != null && employeeSubDeptId != null) break;
              }
            }

            if (deptId != null && Number(employeeDeptId) !== deptId) return false;
            if (subDeptId != null && Number(employeeSubDeptId) !== subDeptId) return false;
            if (positionIds.length > 0 && !positionIds.includes(Number(employeePositionId))) return false;
            return true;
          })
          .map((e) => ({
            value: String(e.id),
            label: `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || `Çalışan #${e.id}`,
          }));
    }, [employees, selectedDeptId, selectedSubDeptId, selectedPositionIds, departments]);

    /* ── Handlers ── */
    const handleDeptChange = (v: string) => {
      setSelectedDeptId(v);
      setSelectedSubDeptId("");
      setSelectedPositionIds([]);
      setSelectedEmployeeIds([]);
    };

    const handleSubDeptChange = (v: string) => {
      setSelectedSubDeptId(v);
      setSelectedPositionIds([]);
      setSelectedEmployeeIds([]);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setError("");
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    /* ── Create task ── */
    const handleCreateTask = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitted(true);
      const title = form.title.trim();
      const description = form.description.trim();

      if (!title || !description) {
        setError("Başlık ve açıklama zorunludur.");
        setSuccess("");
        return;
      }

      try {
        setLoading(true);
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

        if (selectedEmployeeIds.length > 0) {
          const uniqueEmployeeIds = [...new Set(selectedEmployeeIds.map(Number))];
          await Promise.all(uniqueEmployeeIds.map((employeeId) => assignTask(taskId, employeeId)));
        }

        navigate("/app/tasks", {
          state: {
            taskCreated: true,
            createdTaskTitle: title,
          },
        });
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
      } finally {
        setLoading(false);
      }
    };

    const titleError = submitted && !form.title.trim();
    const descriptionError = submitted && !form.description.trim();
    const isCreateDisabled = !form.title.trim() || !form.description.trim() || loading;

    const inputClass =
        "w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 shadow-sm outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30";
    const labelClass = "text-sm font-medium text-slate-300";
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    return (
        <div className="w-full px-3 sm:px-6">
          <div className="max-w-none w-full mx-auto">
            <div className="mb-6 mt-2">
              <h1 className="text-2xl font-semibold">Görev Oluştur</h1>
              <p className="text-slate-400 text-sm mt-1">
                Detayları doldurun ve yeni bir görev kaydı oluşturun.
              </p>
            </div>

            {error && (
                <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
                  <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  {error}
                </div>
            )}

            {success && (
                <div className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </div>
            )}

            <form
                onSubmit={handleCreateTask}
                className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/45 p-7 rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(15,23,42,0.6)] w-full"
            >
              {/* ── Görev Başlığı ve Açıklaması ── */}
              <div className="md:col-span-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
                  Görev Bilgileri
                </h2>
                <div className="h-px bg-slate-700/60" />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className={labelClass}>Başlık *</label>
                <input
                    name="title"
                    placeholder="Örn: Dashboard hata düzeltmesi"
                    value={form.title}
                    onChange={handleChange}
                    className={`${inputClass} ${titleError ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                />
                {titleError && <p className="text-xs text-red-300">Başlık zorunludur.</p>}
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className={labelClass}>Açıklama *</label>
                <textarea
                    name="description"
                    placeholder="Görev detaylarını yaz..."
                    value={form.description}
                    rows={3}
                    onChange={handleChange}
                    className={`${inputClass} resize-y ${descriptionError ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                />
                {descriptionError && <p className="text-xs text-red-300">Açıklama zorunludur.</p>}
              </div>

              {/* ── Tarihler ── */}
              <div className="md:col-span-2 mt-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                  Tarihler (Opsiyonel)
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Başlangıç Tarihi</label>
                <input
                    type="datetime-local"
                    value={form.startDate}
                    min={nowLocal}
                    className={inputClass}
                    onChange={(e) => {
                      setError("");
                      setForm((prev) => ({ ...prev, startDate: e.target.value }));
                    }}
                />
                <p className="text-xs text-slate-500">Takvimden seçebilir veya elle girebilirsiniz.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Bitiş Tarihi</label>
                <input
                    type="datetime-local"
                    value={form.dueDate}
                    min={form.startDate || nowLocal}
                    className={inputClass}
                    onChange={(e) => {
                      setError("");
                      setForm((prev) => ({ ...prev, dueDate: e.target.value }));
                    }}
                />
                <p className="text-xs text-slate-500">Saat bilgisi zorunluysa bu alandan seçin.</p>
              </div>

              {/* ── Organizasyon başlığı ── */}
              <div className="md:col-span-2 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Çalışan Ata (Opsiyonel)
                  </h2>
                  <div className="flex items-center gap-3">
                    <StepBadge step={1} label="Departman" done={!!selectedDeptId} />
                    <span className="text-slate-700">›</span>
                    <StepBadge step={2} label="Alt Departman" done={!!selectedSubDeptId} />
                    <span className="text-slate-700">›</span>
                    <StepBadge step={3} label="Pozisyon" done={selectedPositionIds.length > 0} />
                    <span className="text-slate-700">›</span>
                    <StepBadge step={4} label="Çalışan" done={selectedEmployeeIds.length > 0} />
                  </div>
                </div>
                <div className="h-px bg-slate-700/60" />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Departman</label>
                <MiniDropdown
                    value={selectedDeptId}
                    options={deptOptions}
                    placeholder="Departman seçin"
                    onChange={handleDeptChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  Alt Departman
                  {!selectedDeptId && <span className="ml-1 text-slate-600 font-normal text-xs">— önce departman seçin</span>}
                </label>
                <MiniDropdown
                    value={selectedSubDeptId}
                    options={subDeptOptions}
                    placeholder={
                      !selectedDeptId
                          ? "Önce departman seçin"
                          : subDeptOptions.length
                              ? "Alt departman seçin"
                              : "Alt departman bulunamadı"
                    }
                    disabled={!selectedDeptId || subDeptOptions.length === 0}
                    onChange={handleSubDeptChange}
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className={labelClass}>
                  Pozisyon
                  {!selectedSubDeptId && <span className="ml-1 text-slate-600 font-normal text-xs">— önce alt departman seçin</span>}
                </label>
                <MultiDropdown
                    values={selectedPositionIds}
                    options={positionOptions}
                    placeholder={
                      !selectedSubDeptId
                          ? "Önce alt departman seçin"
                          : positionOptions.length === 0
                              ? "Bu alt departmanda pozisyon bulunamadı"
                              : "Pozisyon seçin (çoklu)"
                    }
                    disabled={!selectedSubDeptId || positionOptions.length === 0}
                    onChange={(values) => {
                      setSelectedPositionIds(values);
                      setSelectedEmployeeIds([]);
                    }}
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className={labelClass}>Çalışan</label>
                <MultiDropdown
                    values={selectedEmployeeIds}
                    options={employeeOptions}
                    placeholder={
                      !selectedSubDeptId
                          ? "Önce alt departman seçin"
                          : employeeOptions.length === 0
                              ? "Bu departmanda çalışan bulunamadı"
                              : "Çalışan seçin (çoklu, opsiyonel)"
                    }
                    disabled={!selectedSubDeptId || employeeOptions.length === 0}
                    onChange={setSelectedEmployeeIds}
                />
              </div>

              {/* ── Öncelik ── */}
              <div className="md:col-span-2 mt-2">
                <div className="h-px bg-slate-700/60 mb-4" />
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Öncelik</label>
                  <MiniDropdown
                      value={form.priority}
                      options={[
                        { value: "LOW", label: "Düşük" },
                        { value: "MEDIUM", label: "Orta" },
                        { value: "HIGH", label: "Yüksek" },
                      ]}
                      placeholder="Öncelik seçin"
                      onChange={(v) => setForm({ ...form, priority: v })}
                  />
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="md:col-span-2 pt-4 border-t border-white/10 mt-2 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/app/tasks")}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-300 border border-slate-600 hover:border-slate-400 hover:text-white transition"
                >
                  İptal
                </button>
                <button
                    type="submit"
                    disabled={isCreateDisabled}
                    className="rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/40 px-5 py-2.5 text-sm font-semibold text-white transition flex items-center gap-2"
                >
                  {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                          />
                          <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Oluşturuluyor...
                      </>
                  ) : (
                      "Görev Oluştur"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
    );
  };

  export default CreateTaskPage;
