import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    ChevronDown,
    ChevronRight,
    Edit3,
    Layers3,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from "lucide-react";

import {
    createDepartment,
    getDepartments,
    updateDepartment,
} from "../../services/departmentService";
import { getAllEmployees } from "../../services/employeeService";
import type { Department, DepartmentPosition, SubDepartment } from "../../types/departmentTypes";
import type { NormalizedEmployee } from "../../types/employeeTypes";
import { hasAnyRole, ROLE_SYSTEM_ADMIN } from "../../utils/auth";

const emptyPosition = (): DepartmentPosition => ({
    name: "",
    description: "",
});

const emptySubDepartment = (): SubDepartment => ({
    name: "",
    description: "",
    managerId: null,
    positions: [emptyPosition()],
});

const emptyDepartment = (): Department => ({
    name: "",
    description: "",
    managerId: null,
    subDepartments: [emptySubDepartment()],
});

const panelClass = "rounded-2xl border border-white/10 bg-slate-900/45 shadow-[0_0_45px_rgba(15,23,42,0.45)]";
const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30";
const pageSize = 6;

const normalizeDepartment = (department: Department): Department => ({
    id: department.id,
    name: department.name ?? "",
    description: department.description ?? "",
    managerId: department.managerId ?? null,
    deleted: department.deleted,
    subDepartments:
        department.subDepartments?.length > 0
            ? department.subDepartments.map((sub) => ({
                  name: sub.name ?? "",
                  description: sub.description ?? "",
                  managerId: sub.managerId ?? null,
                  positions:
                      sub.positions?.length > 0
                          ? sub.positions.map((position) => ({
                                name: position.name ?? "",
                                description: position.description ?? "",
                            }))
                          : [emptyPosition()],
              }))
            : [emptySubDepartment()],
});

const sanitizeDepartment = (department: Department): Department => ({
    ...department,
    name: department.name.trim(),
    description: department.description.trim(),
    subDepartments: department.subDepartments
        .filter((sub) => sub.name.trim() || sub.description.trim() || sub.positions.some((position) => position.name.trim()))
        .map((sub) => ({
            ...sub,
            name: sub.name.trim(),
            description: sub.description.trim(),
            positions: sub.positions
                .filter((position) => position.name.trim() || position.description.trim())
                .map((position) => ({
                    name: position.name.trim(),
                    description: position.description.trim(),
                })),
        })),
});

const DepartmentManagementPage = () => {
    const canManageDepartments = hasAnyRole([ROLE_SYSTEM_ADMIN]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [form, setForm] = useState<Department>(() => emptyDepartment());
    const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
    const [expandedDepartmentIds, setExpandedDepartmentIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadDepartments = async () => {
        setLoading(true);
        setError("");

        try {
            const [departmentList, employeeList] = await Promise.all([
                getDepartments(),
                getAllEmployees(),
            ]);

            setDepartments(departmentList);
            setEmployees(employeeList);
        } catch (loadError) {
            console.error(loadError);
            setError("Departmanlar alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDepartments();
    }, []);

    const activeDepartments = useMemo(
        () => departments.filter((department) => department.deleted !== true),
        [departments]
    );
    const passiveDepartments = useMemo(
        () => departments.filter((department) => department.deleted === true),
        [departments]
    );

    const filteredDepartments = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase("tr-TR");

        return departments.filter((department) => {
            if (!query) return true;

            return [
                department.name,
                department.description,
                ...(department.subDepartments ?? []).flatMap((sub) => [
                    sub.name,
                    sub.description,
                    ...(sub.positions ?? []).map((position) => position.name),
                ]),
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("tr-TR")
                .includes(query);
        });
    }, [departments, searchTerm]);

    const totalEmployees = useMemo(
        () => employees.length,
        [employees]
    );

    const employeeCountByDepartmentId = useMemo(() => {
        return employees.reduce<Record<number, number>>((counts, employee) => {
            if (employee.departmentId == null) return counts;

            counts[employee.departmentId] = (counts[employee.departmentId] ?? 0) + 1;
            return counts;
        }, {});
    }, [employees]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / pageSize));
    const paginatedDepartments = useMemo(
        () => filteredDepartments.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, filteredDepartments]
    );

    const resetForm = () => {
        setForm(emptyDepartment());
        setEditingDepartmentId(null);
        setMessage("");
        setError("");
    };

    const startEdit = (department: Department) => {
        setForm(normalizeDepartment(department));
        setEditingDepartmentId(department.id ?? null);
        setMessage("");
        setError("");
    };

    const updateFormField = (field: keyof Department, value: string | number | null) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const updateSubDepartment = (subIndex: number, field: keyof SubDepartment, value: string | number | null) => {
        setForm((current) => ({
            ...current,
            subDepartments: current.subDepartments.map((sub, index) =>
                index === subIndex ? { ...sub, [field]: value } : sub
            ),
        }));
    };

    const updatePosition = (subIndex: number, positionIndex: number, field: keyof DepartmentPosition, value: string) => {
        setForm((current) => ({
            ...current,
            subDepartments: current.subDepartments.map((sub, index) =>
                index === subIndex
                    ? {
                          ...sub,
                          positions: sub.positions.map((position, posIndex) =>
                              posIndex === positionIndex ? { ...position, [field]: value } : position
                          ),
                      }
                    : sub
            ),
        }));
    };

    const addSubDepartment = () => {
        setForm((current) => ({
            ...current,
            subDepartments: [...current.subDepartments, emptySubDepartment()],
        }));
    };

    const removeSubDepartment = (subIndex: number) => {
        setForm((current) => ({
            ...current,
            subDepartments:
                current.subDepartments.length > 1
                    ? current.subDepartments.filter((_, index) => index !== subIndex)
                    : [emptySubDepartment()],
        }));
    };

    const addPosition = (subIndex: number) => {
        setForm((current) => ({
            ...current,
            subDepartments: current.subDepartments.map((sub, index) =>
                index === subIndex ? { ...sub, positions: [...sub.positions, emptyPosition()] } : sub
            ),
        }));
    };

    const removePosition = (subIndex: number, positionIndex: number) => {
        setForm((current) => ({
            ...current,
            subDepartments: current.subDepartments.map((sub, index) =>
                index === subIndex
                    ? {
                          ...sub,
                          positions:
                              sub.positions.length > 1
                                  ? sub.positions.filter((_, posIndex) => posIndex !== positionIndex)
                                  : [emptyPosition()],
                      }
                    : sub
            ),
        }));
    };

    const saveDepartment = async () => {
        if (!canManageDepartments) return;

        const payload = sanitizeDepartment(form);

        if (!payload.name || !payload.description) {
            setError("Departman adı ve açıklaması zorunludur.");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            if (editingDepartmentId) {
                await updateDepartment(editingDepartmentId, payload);
                setMessage("Departman güncellendi.");
            } else {
                await createDepartment(payload);
                setMessage("Departman oluşturuldu.");
            }

            resetForm();
            await loadDepartments();
        } catch (saveError) {
            console.error(saveError);
            setError(editingDepartmentId ? "Departman güncellenemedi." : "Departman oluşturulamadı.");
        } finally {
            setSaving(false);
        }
    };

    const toggleDepartmentStatus = async (department: Department) => {
        if (!canManageDepartments || !department.id) return;

        setError("");
        setMessage("");

        try {
            await updateDepartment(department.id, {
                ...normalizeDepartment(department),
                deleted: department.deleted !== true,
            });
            setMessage(department.deleted ? "Departman tekrar aktife alındı." : "Departman pasife alındı.");
            await loadDepartments();
        } catch (toggleError) {
            console.error(toggleError);
            setError("Departman durumu güncellenemedi.");
        }
    };

    const toggleExpanded = (id?: number) => {
        if (!id) return;

        setExpandedDepartmentIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    return (
        <div className="min-h-full px-3 py-6 text-white sm:px-6">
            <div
                className={`mx-auto grid max-w-none gap-5 ${
                    canManageDepartments ? "xl:grid-cols-[minmax(0,1fr)_430px]" : "grid-cols-1"
                }`}
            >
                <main className="space-y-5">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Departman Yönetimi</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            {canManageDepartments
                                ? "Departmanları listeleyin, arayın; aktif kayıtları düzenleyin veya pasif kayıtları tekrar açın."
                                : "Departmanları ve bağlı organizasyon yapısını görüntüleyin."}
                        </p>
                    </header>

                    {(message || error) && (
                        <div
                            className={`rounded-xl border px-4 py-3 text-sm ${
                                error
                                    ? "border-rose-400/25 bg-rose-500/10 text-rose-200"
                                    : "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                            }`}
                        >
                            {error || message}
                        </div>
                    )}

                    <section className={`${panelClass} p-4`}>
                        <div className="grid gap-3">
                            <label className="relative block">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Departman adı veya açıklama ile ara..."
                                    className={`${inputClass} h-12 pl-12`}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        <div className={`${panelClass} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Toplam Departman</p>
                                    <p className="mt-1 text-3xl font-bold text-white">{activeDepartments.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${panelClass} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                                    <Trash2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Pasif Departman</p>
                                    <p className="mt-1 text-3xl font-bold text-white">{passiveDepartments.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${panelClass} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                                    <Layers3 className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Kayıtlı Çalışan</p>
                                    <p className="mt-1 text-3xl font-bold text-white">{totalEmployees}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={`${panelClass} overflow-hidden`}>
                        <div
                            className={`grid border-b border-white/10 bg-slate-950/35 px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-400 ${
                                canManageDepartments
                                    ? "grid-cols-[1.1fr_1.3fr_0.7fr_0.8fr_0.8fr]"
                                    : "grid-cols-[1.1fr_1.3fr_0.7fr_0.8fr]"
                            }`}
                        >
                            <span>Departman Adı</span>
                            <span>Açıklama</span>
                            <span>Durum</span>
                            <span>Çalışan Sayısı</span>
                            {canManageDepartments && <span className="text-right">İşlemler</span>}
                        </div>

                        {loading ? (
                            <div className="px-5 py-14 text-center text-sm text-slate-400">Departmanlar yükleniyor...</div>
                        ) : filteredDepartments.length === 0 ? (
                            <div className="px-5 py-14 text-center text-sm text-slate-400">Departman bulunamadı.</div>
                        ) : (
                            paginatedDepartments.map((department) => {
                                const isExpanded = department.id != null && expandedDepartmentIds.includes(department.id);
                                const employeeCount =
                                    department.id == null ? 0 : employeeCountByDepartmentId[department.id] ?? 0;

                                return (
                                    <div key={department.id ?? department.name} className="border-b border-white/10 last:border-b-0">
                                        <div
                                            className={`grid items-center gap-4 px-4 py-4 text-sm transition hover:bg-slate-950/30 ${
                                                canManageDepartments
                                                    ? "grid-cols-[1.1fr_1.3fr_0.7fr_0.8fr_0.8fr]"
                                                    : "grid-cols-[1.1fr_1.3fr_0.7fr_0.8fr]"
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleExpanded(department.id)}
                                                className="flex min-w-0 items-center gap-3 text-left"
                                            >
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                                                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                                </span>
                                                <span className="truncate font-bold text-white">{department.name}</span>
                                            </button>
                                            <span className="line-clamp-2 text-slate-300">{department.description || "-"}</span>
                                            <span>
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                                                        department.deleted
                                                            ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
                                                            : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                                    }`}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {department.deleted ? "Pasif" : "Aktif"}
                                                </span>
                                            </span>
                                            <span className="font-semibold text-slate-200">{employeeCount}</span>
                                            {canManageDepartments && (
                                                <span className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(department)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 transition hover:bg-indigo-500/20"
                                                        title="Güncelle"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDepartmentStatus(department)}
                                                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                                                            department.deleted
                                                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                                                : "border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                                        }`}
                                                        title={department.deleted ? "Aktife al" : "Pasife al"}
                                                    >
                                                        {department.deleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                                    </button>
                                                </span>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="space-y-3 border-t border-white/10 bg-slate-950/20 px-5 py-4">
                                                {department.subDepartments?.length ? (
                                                    department.subDepartments.map((sub, index) => (
                                                        <div key={`${sub.name}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                                                            <p className="font-semibold text-sky-200">{sub.name}</p>
                                                            <p className="mt-1 text-sm text-slate-400">{sub.description || "Açıklama yok"}</p>
                                                            {sub.positions?.length > 0 && (
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {sub.positions.map((position, posIndex) => (
                                                                        <span
                                                                            key={`${position.name}-${posIndex}`}
                                                                            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                                                                        >
                                                                            {position.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-500">Alt departman bulunmuyor.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        {!loading && filteredDepartments.length > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400">
                                <span>Toplam {filteredDepartments.length} departman</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        disabled={currentPage === 1}
                                        className="h-9 rounded-xl border border-white/10 px-3 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Önceki
                                    </button>
                                    <span className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 font-semibold text-white">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-9 rounded-xl border border-white/10 px-3 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Sonraki
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </main>

                {canManageDepartments && (
                <aside className={`${panelClass} h-fit p-6 xl:sticky xl:top-6`}>
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {editingDepartmentId ? "Departman Güncelle" : "Yeni Departman"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Departman bilgilerini ve alt yapısını buradan yönetin.
                            </p>
                        </div>
                        {editingDepartmentId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                                title="Yeni departman"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-5">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-300">Departman Adı *</span>
                            <input
                                value={form.name}
                                onChange={(event) => updateFormField("name", event.target.value)}
                                placeholder="Departman adını giriniz"
                                className={`${inputClass} mt-2`}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-300">Departman Açıklama *</span>
                            <input
                                value={form.description}
                                onChange={(event) => updateFormField("description", event.target.value)}
                                placeholder="Departman açıklamasını giriniz"
                                className={`${inputClass} mt-2`}
                            />
                        </label>

                        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">Alt Departmanlar</p>
                                    <p className="mt-1 text-xs text-slate-500">Alt departman ve pozisyonları ekleyin.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addSubDepartment}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Alt Departman
                                </button>
                            </div>

                            <div className="max-h-[46vh] space-y-4 overflow-y-auto pr-1">
                                {form.subDepartments.map((sub, subIndex) => (
                                    <div key={subIndex} className="rounded-xl border border-white/10 bg-slate-900/45 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-sky-200">Alt Departman {subIndex + 1}</p>
                                            <button
                                                type="button"
                                                onClick={() => removeSubDepartment(subIndex)}
                                                className="rounded-lg p-1.5 text-rose-300 transition hover:bg-rose-500/10"
                                                title="Alt departmanı sil"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="grid gap-3">
                                            <input
                                                value={sub.name}
                                                onChange={(event) => updateSubDepartment(subIndex, "name", event.target.value)}
                                                placeholder="Alt departman adı"
                                                className={inputClass}
                                            />
                                            <input
                                                value={sub.description}
                                                onChange={(event) => updateSubDepartment(subIndex, "description", event.target.value)}
                                                placeholder="Alt departman açıklaması"
                                                className={inputClass}
                                            />
                                        </div>

                                        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pozisyonlar</p>
                                                <button
                                                    type="button"
                                                    onClick={() => addPosition(subIndex)}
                                                    className="text-xs font-semibold text-sky-300 transition hover:text-sky-200"
                                                >
                                                    + Pozisyon
                                                </button>
                                            </div>
                                            {sub.positions.map((position, positionIndex) => (
                                                <div key={positionIndex} className="grid gap-2 rounded-xl border border-white/10 bg-slate-950/30 p-3">
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={position.name}
                                                            onChange={(event) => updatePosition(subIndex, positionIndex, "name", event.target.value)}
                                                            placeholder="Pozisyon adı"
                                                            className={`${inputClass} min-w-0 flex-1`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removePosition(subIndex, positionIndex)}
                                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-rose-300 transition hover:bg-rose-500/10"
                                                            title="Pozisyon sil"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={position.description}
                                                        onChange={(event) => updatePosition(subIndex, positionIndex, "description", event.target.value)}
                                                        placeholder="Pozisyon açıklaması"
                                                        className={inputClass}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="h-12 rounded-xl border border-white/10 bg-slate-900/70 px-5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={saveDepartment}
                                disabled={saving}
                                className="h-12 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Kaydediliyor..." : editingDepartmentId ? "Güncelle" : "Oluştur"}
                            </button>
                        </div>
                    </div>
                </aside>
                )}
            </div>
        </div>
    );
};

export default DepartmentManagementPage;
