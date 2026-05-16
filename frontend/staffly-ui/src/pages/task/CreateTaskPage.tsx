import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import axios from "axios";
import { CalendarDays, Check, ClipboardCheck, Search, Send, Users } from "lucide-react";

import { assignTask, createTask } from "../../services/taskService";
import { getDepartments } from "../../services/departmentService";
import { getAllEmployees, getMyProfile } from "../../services/employeeService";
import { hasAnyRole, ROLE_DEPARTMENT_MANAGER } from "../../utils/auth";
import type { NormalizedEmployee } from "../../types/employeeTypes";
import type { Department } from "../../types/departmentTypes";

type CreateTaskForm = {
    title: string;
    description: string;
    priority: string;
    startDate: string;
    dueDate: string;
    departmentId: string;
};

const inputClass =
    "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/25";

const panelClass = "rounded-[26px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_34px_rgba(15,23,42,0.35)]";

const priorityOptions = [
    { value: "LOW", label: "Düşük", dot: "bg-emerald-400" },
    { value: "MEDIUM", label: "Orta", dot: "bg-amber-400" },
    { value: "HIGH", label: "Yüksek", dot: "bg-rose-400" },
];

const employeeName = (employee: NormalizedEmployee) =>
    employee.basicInfo?.fullName || `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || `Çalışan #${employee.id}`;

const CreateTaskPage = () => {
    const navigate = useNavigate();
    const isDeptManager = hasAnyRole([ROLE_DEPARTMENT_MANAGER]);

    const [form, setForm] = useState<CreateTaskForm>({
        title: "",
        description: "",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
        departmentId: "",
    });
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([getDepartments(), getAllEmployees()])
            .then(([departmentRows, employeeRows]) => {
                const departmentList = Array.isArray(departmentRows) ? departmentRows : [];
                const employeeList = Array.isArray(employeeRows) ? employeeRows : [];

                setDepartments(departmentList);
                setEmployees(employeeList);

                if (isDeptManager) {
                    getMyProfile()
                        .then((profile) => {
                            const deptId = profile?.departmentId ?? profile?.department?.id ?? null;
                            if (deptId != null) {
                                setForm((prev) => ({ ...prev, departmentId: String(deptId) }));
                            }
                        })
                        .catch((err) => {
                            console.error("Department manager profile could not be loaded", err);
                            setError("Departman bilginiz alınamadı.");
                        });
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Görev atama verileri yüklenemedi.");
            });
    }, [isDeptManager]);

    const selectedDepartment = useMemo(
        () => departments.find((department) => department.id != null && String(department.id) === form.departmentId) ?? null,
        [departments, form.departmentId]
    );

    const visibleEmployees = useMemo(() => {
        const departmentId = form.departmentId ? Number(form.departmentId) : null;
        const query = employeeSearch.trim().toLowerCase();

        return employees.filter((employee) => {
            if (departmentId != null && Number(employee.departmentId) !== departmentId) {
                return false;
            }

            if (!query) return true;

            return [
                employeeName(employee),
                employee.email,
                employee.organizationInfo?.positionName,
                employee.organizationInfo?.departmentName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query);
        });
    }, [employeeSearch, employees, form.departmentId]);

    const selectedEmployees = useMemo(
        () => employees.filter((employee) => selectedEmployeeIds.includes(employee.id)),
        [employees, selectedEmployeeIds]
    );

    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    const toggleEmployee = (id: number) => {
        setSelectedEmployeeIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const title = form.title.trim();
        const description = form.description.trim();

        if (!title || !description || !form.startDate || !form.dueDate || !form.departmentId) {
            setError("Başlık, açıklama, tarih ve departman bilgisi zorunludur.");
            return;
        }

        if (selectedEmployeeIds.length === 0) {
            setError("En az bir çalışan seçin.");
            return;
        }

        try {
            setLoading(true);
            const created = await createTask({
                title,
                description,
                priority: form.priority,
                startDate: form.startDate,
                dueDate: form.dueDate,
                departmentId: Number(form.departmentId),
            });

            await Promise.all([...new Set(selectedEmployeeIds)].map((employeeId) => assignTask(created.id, employeeId)));

            navigate("/app/tasks", {
                state: {
                    taskCreated: true,
                    createdTaskTitle: title,
                },
            });
        } catch (err) {
            console.error("CREATE TASK ERROR:", err);
            if (axios.isAxiosError(err)) {
                const message =
                    (err.response?.data as { message?: string })?.message ||
                    (typeof err.response?.data === "string" ? err.response.data : "") ||
                    `Görev oluşturulamadı (${err.response?.status ?? "hata"})`;
                setError(message);
                return;
            }
            setError("Görev oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    const canSubmit =
        form.title.trim() &&
        form.description.trim() &&
        form.startDate &&
        form.dueDate &&
        form.departmentId &&
        selectedEmployeeIds.length > 0 &&
        !loading;

    return (
        <div className="space-y-6 text-slate-100">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Task Management</div>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Görev Ata</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                        {isDeptManager
                            ? "Departmanınızdaki çalışanlara hızlıca görev atayın."
                            : "Departman seçerek çalışanlara görev atayın."}
                    </p>
                </div>
            </div>

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

            <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className={panelClass}>
                            <ClipboardCheck className="h-6 w-6 text-sky-300" />
                            <div className="mt-3 text-sm text-slate-400">Departman Görevleri</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{selectedEmployees.length}</div>
                        </div>
                        <div className={panelClass}>
                            <Users className="h-6 w-6 text-emerald-300" />
                            <div className="mt-3 text-sm text-slate-400">Çalışan Havuzu</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{visibleEmployees.length}</div>
                        </div>
                        <div className={panelClass}>
                            <Check className="h-6 w-6 text-violet-300" />
                            <div className="mt-3 text-sm text-slate-400">Seçili Çalışan</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{selectedEmployeeIds.length}</div>
                        </div>
                        <div className={panelClass}>
                            <CalendarDays className="h-6 w-6 text-amber-300" />
                            <div className="mt-3 text-sm text-slate-400">Öncelik</div>
                            <div className="mt-1 text-2xl font-semibold text-white">
                                {priorityOptions.find((item) => item.value === form.priority)?.label}
                            </div>
                        </div>
                    </div>

                    <section className={panelClass}>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Çalışanlarım</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    {isDeptManager
                                        ? `${selectedDepartment?.name ?? "Departmanınız"} çalışanları listelenir.`
                                        : "Önce departman seçin, ardından görev atanacak çalışanları işaretleyin."}
                                </p>
                            </div>

                            <div className="relative w-full sm:w-80">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={employeeSearch}
                                    onChange={(event) => setEmployeeSearch(event.target.value)}
                                    className={`${inputClass} pl-11`}
                                    placeholder="Çalışan ara"
                                />
                            </div>
                        </div>

                        {!isDeptManager && (
                            <div className="mb-4">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Departman</label>
                                <select
                                    value={form.departmentId}
                                    onChange={(event) => {
                                        setForm((prev) => ({ ...prev, departmentId: event.target.value }));
                                        setSelectedEmployeeIds([]);
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">Departman seçin</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-2xl border border-white/10">
                            <div className="grid grid-cols-[56px_1fr_1fr] border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                <span />
                                <span>Çalışan</span>
                                <span>Pozisyon</span>
                            </div>

                            <div className="max-h-[34rem] overflow-y-auto">
                                {visibleEmployees.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-slate-400">Bu departmanda çalışan bulunamadı.</div>
                                ) : (
                                    visibleEmployees.map((employee) => {
                                        const checked = selectedEmployeeIds.includes(employee.id);
                                        const photoUrl = employee.profilePhotoUrl || employee.mediaInfo?.profilePhotoUrl;

                                        return (
                                            <button
                                                key={employee.id}
                                                type="button"
                                                onClick={() => toggleEmployee(employee.id)}
                                                className="grid w-full grid-cols-[56px_1fr_1fr] items-center gap-3 border-b border-white/8 px-4 py-4 text-left transition last:border-b-0 hover:bg-sky-500/8"
                                            >
                                                <span
                                                    className={`flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${
                                                        checked ? "border-violet-300 bg-violet-500 text-white" : "border-slate-500 text-transparent"
                                                    }`}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </span>
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-slate-800">
                                                        {photoUrl ? (
                                                            <img src={photoUrl} alt={employeeName(employee)} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                                                                {employee.mediaInfo?.initials || employeeName(employee).slice(0, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-semibold text-white">{employeeName(employee)}</span>
                                                        <span className="block truncate text-xs text-slate-500">{employee.email || `EMP-${employee.id}`}</span>
                                                    </span>
                                                </span>
                                                <span className="truncate text-sm text-slate-300">{employee.organizationInfo?.positionName || "-"}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <aside className={`${panelClass} h-fit xl:sticky xl:top-6`}>
                    <h2 className="text-xl font-semibold text-white">Yeni Görev Ata</h2>
                    <div className="mt-5 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Çalışan(lar) *</label>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
                                {selectedEmployees.length > 0
                                    ? `${selectedEmployees.length} çalışan seçildi`
                                    : "Çalışan seçin"}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Görev Başlığı *</label>
                            <input
                                value={form.title}
                                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                className={inputClass}
                                placeholder="Görev başlığını giriniz"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Açıklama *</label>
                            <textarea
                                value={form.description}
                                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                                rows={5}
                                className={`${inputClass} resize-y`}
                                placeholder="Görev açıklamasını giriniz"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Öncelik *</label>
                            <select
                                value={form.priority}
                                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                                className={inputClass}
                            >
                                {priorityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">Başlangıç *</label>
                                <input
                                    type="datetime-local"
                                    min={nowLocal}
                                    value={form.startDate}
                                    onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">Bitiş *</label>
                                <input
                                    type="datetime-local"
                                    min={form.startDate || nowLocal}
                                    value={form.dueDate}
                                    onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => navigate("/app/tasks")}
                                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                {loading ? "Atanıyor..." : "Görevi Ata"}
                            </button>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
};

export default CreateTaskPage;
