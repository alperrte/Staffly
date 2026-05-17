import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Building2, Calendar, ChevronDown, Filter, Mail, Plus, Search, UserCheck, UserX, Users, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    getAllEmployees,
    getDepartments,
    getPositionsBySubDepartmentId,
    getSubDepartmentsByDepartmentId,
    updateEmployee,
} from "../../services/employeeService";
import type { Department, DepartmentPosition, NormalizedEmployee, SubDepartment } from "../../types/employeeTypes";
import { emptyPlaceholder } from "../../types/employeeTypes";
import { hasAnyRole, ROLE_HR_MANAGER, ROLE_SYSTEM_ADMIN } from "../../utils/auth";
import { EmployeeActionsModal } from "../../components/employee/EmployeeActionsModal";
import EmployeeEditModal, { type EmployeeEditFormState } from "../../components/employee/EmployeeEditModal";

const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    INACTIVE: "bg-red-500/15 text-red-300 border border-red-500/30",
    PASSIVE: "bg-red-500/15 text-red-300 border border-red-500/30",
    LEAVE: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
};

const statusLabelTR: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
    PASSIVE: "Pasif",
    LEAVE: "İzinli",
};

const EMPTY_FORM: EmployeeEditFormState = {
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    subDepartmentId: "",
    positionId: "",
    status: "ACTIVE",
    phone: "",
    tc: "",
    birthDate: "",
    gender: "",
    medeniDurum: "",
};

const initials = (first?: string, last?: string) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const buildEmployeeSearchText = (employee: NormalizedEmployee) =>
    [
        employee.basicInfo.fullName,
        employee.basicInfo.employeeCode,
        employee.contactInfo.email,
        employee.contactInfo.phone,
        employee.organizationInfo.departmentName,
        employee.organizationInfo.subDepartmentName,
        employee.organizationInfo.positionName,
        employee.organizationInfo.titleName,
        employee.organizationInfo.managerName,
        employee.workInfo.workType,
        employee.workInfo.gender,
        employee.workInfo.medeniDurum,
        employee.workInfo.tc,
        employee.workInfo.salary,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

const EmployeeListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
    const [positions, setPositions] = useState<DepartmentPosition[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [search, setSearch] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterPosition, setFilterPosition] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const [selectedEmployee, setSelectedEmployee] = useState<NormalizedEmployee | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<NormalizedEmployee | null>(null);
    const [editForm, setEditForm] = useState<EmployeeEditFormState>(EMPTY_FORM);
    const [editSubDepartments, setEditSubDepartments] = useState<SubDepartment[]>([]);
    const [editPositions, setEditPositions] = useState<DepartmentPosition[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let alive = true;

        Promise.all([getAllEmployees(), getDepartments()])
            .then(([employeeData, departmentData]) => {
                if (!alive) return;

                setEmployees(employeeData);
                setDepartments(Array.isArray(departmentData) ? departmentData : []);
            })
            .catch((fetchError) => {
                console.error(fetchError);
                setError("Veriler alınamadı.");
            })
            .finally(() => {
                if (alive) setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        const flattenedSubDepartments = departments.flatMap((department) => department.subDepartments ?? []);
        const flattenedPositions = departments.flatMap((department) =>
            (department.subDepartments ?? []).flatMap((subDepartment) =>
                (subDepartment.positions ?? []).map((position) => ({
                    ...position,
                    subDepartmentId: subDepartment.id,
                }))
            )
        );

        setSubDepartments(flattenedSubDepartments);
        setPositions(flattenedPositions);
    }, [departments]);

    useEffect(() => {
        const state = location.state as { employeeCreated?: boolean; createdEmployeeName?: string } | null;

        if (state?.employeeCreated) {
            const name = state.createdEmployeeName?.trim();
            setSuccessMessage(name ? `${name} başarıyla oluşturuldu.` : "Çalışan oluşturuldu.");
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const canEdit = hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]);
    const stats = useMemo(
        () => ({
            total: employees.length,
            active: employees.filter((employee) => employee.status === "ACTIVE").length,
            passive: employees.filter((employee) => employee.status === "PASSIVE" || employee.status === "INACTIVE").length,
        }),
        [employees]
    );

    const enrichedEmployees = useMemo(
        () =>
            employees.map((employee) => ({
                ...employee,
                departmentName:
                    employee.departmentName || departments.find((department) => department.id === employee.departmentId)?.name || "Belirtilmemiş",
                subDepartmentName:
                    employee.subDepartmentName || subDepartments.find((subDepartment) => subDepartment.id === employee.subDepartmentId)?.name || "Belirtilmemiş",
                positionName:
                    employee.positionName || positions.find((position) => position.id === employee.positionId)?.name || employee.titleName || "Belirtilmemiş",
                titleName: employee.titleName || employee.positionName || "Belirtilmemiş",
                managerName: employee.managerName || "Belirtilmemiş",
            })),
        [employees, departments, positions, subDepartments]
    );

    const filteredEmployees = useMemo(() => {
        let filtered = enrichedEmployees;
        const query = search.toLowerCase().trim();

        if (query) {
            filtered = filtered.filter((employee) => buildEmployeeSearchText(employee).includes(query));
        }

        if (filterDepartment) {
            filtered = filtered.filter((employee) => employee.departmentId != null && String(employee.departmentId) === filterDepartment);
        }

        if (filterPosition) {
            filtered = filtered.filter((employee) => employee.positionId != null && String(employee.positionId) === filterPosition);
        }

        if (filterStatus) {
            filtered = filtered.filter((employee) => employee.status === filterStatus);
        }

        return filtered;
    }, [enrichedEmployees, filterDepartment, filterPosition, filterStatus, search]);

    const clearFilters = () => {
        setSearch("");
        setFilterDepartment("");
        setFilterPosition("");
        setFilterStatus("");
    };

    const openEditor = async (employee: NormalizedEmployee) => {
        setEditingEmployee(employee);
        setEditForm({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            departmentId: String(employee.departmentId ?? ""),
            subDepartmentId: String(employee.subDepartmentId ?? ""),
            positionId: String(employee.positionId ?? ""),
            status: employee.status,
            phone: employee.phone ?? "",
            tc: employee.tc ?? "",
            birthDate: employee.birthDate ?? "",
            gender: employee.gender ?? "",
            medeniDurum: employee.medeniDurum ?? "",
        });

        if (employee.departmentId != null) {
            try {
                setEditSubDepartments(await getSubDepartmentsByDepartmentId(employee.departmentId));
            } catch {
                setEditSubDepartments([]);
            }
        }

        if (employee.subDepartmentId != null) {
            try {
                setEditPositions(await getPositionsBySubDepartmentId(employee.subDepartmentId));
            } catch {
                setEditPositions([]);
            }
        }
    };

    const handleDepartmentChange = async (departmentId: string) => {
        setEditForm((prev) => ({
            ...prev,
            departmentId,
            subDepartmentId: "",
            positionId: "",
        }));
        setEditPositions([]);
        setEditSubDepartments([]);

        if (!departmentId) return;

        try {
            setEditSubDepartments(await getSubDepartmentsByDepartmentId(Number(departmentId)));
        } catch {
            setEditSubDepartments([]);
        }
    };

    const handleSubDepartmentChange = async (subDepartmentId: string) => {
        setEditForm((prev) => ({
            ...prev,
            subDepartmentId,
            positionId: "",
        }));
        setEditPositions([]);

        if (!subDepartmentId) return;

        try {
            setEditPositions(await getPositionsBySubDepartmentId(Number(subDepartmentId)));
        } catch {
            setEditPositions([]);
        }
    };

    const saveEdit = async () => {
        if (!editingEmployee) return;

        setSaving(true);
        try {
            const updatedEmployee = await updateEmployee(editingEmployee.id, {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                status: editForm.status,
                phone: editForm.phone,
                birthDate: editForm.birthDate || undefined,
                gender: editForm.gender || undefined,
                medeniDurum: editForm.medeniDurum || undefined,
                tc: editForm.tc || undefined,
                departmentId: editForm.departmentId ? Number(editForm.departmentId) : undefined,
                positionId: editForm.positionId ? Number(editForm.positionId) : undefined,
            });

            setEmployees((prev) => prev.map((employee) => (employee.id === updatedEmployee.id ? updatedEmployee : employee)));
            setSelectedEmployee((current) => (current?.id === updatedEmployee.id ? updatedEmployee : current));
            setEditingEmployee(null);
            setSuccessMessage("Çalışan bilgileri güncellendi.");
        } catch (updateError) {
            console.error(updateError);
            setError("Güncelleme başarısız.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#020817] flex items-center justify-center text-slate-400">Çalışanlar yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-[#020817] text-white">
            <div className="relative flex">
                <div className="flex-1 px-8 py-8">
                    <div className="mb-10 flex flex-wrap items-center justify-between gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.35)]">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent">Çalışanlar</h1>
                                    <p className="mt-1 max-w-lg text-sm text-slate-400">Şirket çalışanlarını yönetin, düzenleyin ve organizasyon yapısını takip edin.</p>
                                </div>
                            </div>
                        </div>

                        {canEdit && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/app/employees/create")}
                                className="flex h-14 items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-8 font-semibold text-white shadow-[0_0_40px_rgba(6,182,212,0.25)] transition hover:shadow-[0_0_60px_rgba(6,182,212,0.4)]"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Çalışan Ekle</span>
                            </motion.button>
                        )}
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {successMessage && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-300">
                                ✓ {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mb-10 grid grid-cols-1 gap-4 xl:grid-cols-3">
                        {[
                            {
                                label: "Toplam Çalışan",
                                value: stats.total,
                                description: "Sistemde kayıtlı çalışanlar",
                                icon: Users,
                                color: "blue",
                            },
                            {
                                label: "Aktif Çalışan",
                                value: stats.active,
                                description: "Aktif olarak çalışan personeller",
                                icon: UserCheck,
                                color: "emerald",
                            },
                            {
                                label: "Pasif Çalışan",
                                value: stats.passive,
                                description: "Pasife alınmış çalışanlar",
                                icon: UserX,
                                color: "rose",
                            },
                        ].map((item, index) => {
                            const Icon = item.icon;

                            const styles = {
                                blue: {
                                    card: "border-blue-400/25 bg-blue-500/10",
                                    icon: "bg-blue-500/15 text-blue-300 shadow-[0_0_32px_rgba(37,99,235,0.28)]",
                                    text: "text-blue-200",
                                    arrow: "bg-blue-500/15 text-blue-300",
                                },
                                emerald: {
                                    card: "border-emerald-400/25 bg-emerald-500/10",
                                    icon: "bg-emerald-500/15 text-emerald-300 shadow-[0_0_32px_rgba(16,185,129,0.22)]",
                                    text: "text-emerald-200",
                                    arrow: "bg-emerald-500/15 text-emerald-300",
                                },
                                rose: {
                                    card: "border-rose-400/25 bg-rose-500/10",
                                    icon: "bg-rose-500/15 text-rose-300 shadow-[0_0_32px_rgba(244,63,94,0.18)]",
                                    text: "text-rose-200",
                                    arrow: "bg-rose-500/15 text-rose-300",
                                },
                                amber: {
                                    card: "border-amber-400/25 bg-amber-500/10",
                                    icon: "bg-amber-500/15 text-amber-300 shadow-[0_0_32px_rgba(245,158,11,0.18)]",
                                    text: "text-amber-200",
                                    arrow: "bg-amber-500/15 text-amber-300",
                                },
                            }[item.color as "blue" | "emerald" | "rose" | "amber"];

                            return (
                                <motion.button
                                    key={item.label}
                                    type="button"
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: index * 0.06 }}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`rounded-2xl border p-5 text-left transition hover:border-white/20 hover:bg-white/[0.04] ${styles.card}`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${styles.icon}`}>
                                                <Icon className="h-8 w-8" />
                                            </div>

                                            <div>
                                                <p className={`text-sm font-bold ${styles.text}`}>
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 text-3xl font-extrabold text-white">
                                                    {item.value}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="mb-10 rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-6 shadow-[0_0_40px_rgba(59,130,246,0.08)] backdrop-blur-2xl">
                        <div className="flex flex-wrap gap-4">
                            <div className="relative flex-1 min-w-[280px]">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Çalışan ara..." className="w-full rounded-2xl border border-slate-700/50 bg-[#0f172a]/80 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60" />
                            </div>

                            <div className="relative min-w-[210px]">
                                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <select value={filterDepartment} onChange={(event) => setFilterDepartment(event.target.value)} className="w-full appearance-none rounded-2xl border border-slate-700/50 bg-[#0f172a]/80 py-4 pl-12 pr-12 text-white outline-none transition focus:border-cyan-500/60">
                                    <option value="">Tüm Departmanlar</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>{department.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            </div>

                            <div className="relative min-w-[180px]">
                                <Activity className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="w-full appearance-none rounded-2xl border border-slate-700/50 bg-[#0f172a]/80 py-4 pl-12 pr-12 text-white outline-none transition focus:border-cyan-500/60">
                                    <option value="">Tüm Durumlar</option>
                                    <option value="ACTIVE">Aktif</option>
                                    <option value="INACTIVE">Pasif</option>
                                    <option value="LEAVE">İzinli</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            </div>

                            <div className="flex gap-3">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex h-14 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 font-semibold text-white">
                                    <Filter className="h-4 w-4" />
                                    Filtrele
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearFilters} className="flex h-14 items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/50 px-6 font-semibold text-slate-300 transition hover:bg-slate-800/50 hover:text-white">
                                    <X className="h-4 w-4" />
                                    Temizle
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/40 shadow-[0_0_40px_rgba(59,130,246,0.08)] backdrop-blur-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1280px]">
                                <thead className="sticky top-0 z-20 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/90 to-slate-800/90">
                                <tr className="text-left text-sm font-medium text-slate-400">
                                    <th className="px-8 py-6 font-semibold">Çalışan</th>
                                    <th className="px-8 py-6 font-semibold">Email</th>
                                    <th className="px-8 py-6 font-semibold">Departman</th>
                                    <th className="px-8 py-6 font-semibold">Pozisyon</th>
                                    <th className="px-8 py-6 font-semibold">İşe Başlama</th>
                                    <th className="px-8 py-6 font-semibold">Durum</th>
                                    <th className="px-8 py-6 text-right font-semibold">İşlemler</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredEmployees.map((employee, index) => (
                                    <motion.tr key={employee.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }} whileHover={{ backgroundColor: "rgba(15,23,42,0.64)" }} onClick={() => setSelectedEmployee(employee)} className="cursor-pointer border-b border-slate-800/30 transition-all duration-200 hover:border-cyan-500/20">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="flex h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_25px_rgba(6,182,212,0.22)]">
                                                        {(employee.profilePhotoUrl || employee.profileImage) ? (
                                                            <img
                                                                src={`${employee.profilePhotoUrl || employee.profileImage}?t=${Date.now()}`}
                                                                alt={employee.basicInfo.fullName}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">{employee.mediaInfo.initials || initials(employee.firstName, employee.lastName)}</div>
                                                        )}
                                                    </div>
                                                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#020817] bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                </div>
                                                <div>
                                                    <div className="text-base font-semibold text-white">{employee.basicInfo.fullName}</div>
                                                    <div className="font-mono text-sm text-slate-500">{employee.basicInfo.employeeCode}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-500" />
                                                <span className="text-slate-300">{emptyPlaceholder(employee.contactInfo.email)}</span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6">
                                                <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                                                    {emptyPlaceholder(employee.organizationInfo.departmentName)}
                                                </span>
                                        </td>

                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-white">{emptyPlaceholder(employee.organizationInfo.positionName)}</div>
                                                <div className="text-xs text-slate-500">{emptyPlaceholder(employee.organizationInfo.subDepartmentName)}</div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">{emptyPlaceholder(employee.workInfo.hireDate)}</span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6">
                                                <span className={`inline-flex rounded-full px-4 py-2 text-xs font-bold ${statusStyles[employee.status] || "border border-white/10 bg-white/5 text-slate-200"}`}>
                                                    {statusLabelTR[employee.status] ?? employee.status}
                                                </span>
                                        </td>

                                        <td className="px-8 py-6 text-right">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setSelectedEmployee(employee);
                                                }}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 text-slate-400 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="5" r="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                    <circle cx="12" cy="19" r="2" />
                                                </svg>
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <EmployeeActionsModal
                    employee={selectedEmployee}
                    isOpen={selectedEmployee != null}
                    onClose={() => setSelectedEmployee(null)}
                    onEdit={openEditor}
                    canEdit={canEdit}
                />

                <EmployeeEditModal
                    isOpen={editingEmployee != null}
                    employee={editingEmployee}
                    form={editForm}
                    departments={departments}
                    subDepartments={editSubDepartments}
                    positions={editPositions}
                    isSaving={saving}
                    onClose={() => setEditingEmployee(null)}
                    onSave={saveEdit}
                    onChange={setEditForm}
                    onDepartmentChange={handleDepartmentChange}
                    onSubDepartmentChange={handleSubDepartmentChange}
                />
            </div>
        </div>
    );
};

export default EmployeeListPage;