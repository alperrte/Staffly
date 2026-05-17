import { useEffect, useMemo, useState } from "react";
import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Eye,
    Mail,
    Search,
    ShieldCheck,
    Users,
} from "lucide-react";

import { getDepartments } from "../../services/departmentService";
import { getAllEmployees, getMyProfile } from "../../services/employeeService";
import type { Department } from "../../types/departmentTypes";
import type { EmployeeApiResponse, NormalizedEmployee } from "../../types/employeeTypes";

const panelClass = "rounded-2xl border border-white/10 bg-slate-900/45 shadow-[0_0_45px_rgba(15,23,42,0.45)]";
const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30";
const pageSize = 8;

const empty = (value?: string | number | null) => {
    if (value == null) return "Belirtilmemiş";
    const text = String(value).trim();
    return text || "Belirtilmemiş";
};

const formatDate = (value?: string | null) => {
    if (!value) return "Belirtilmemiş";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

const isActiveEmployee = (employee: NormalizedEmployee) =>
    ["ACTIVE", "AKTIF", "AKTİF"].includes((employee.status || "").toLocaleUpperCase("tr-TR"));

const collectRoleLabels = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.flatMap(collectRoleLabels);
    }

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return [record.name, record.role, record.roleName, record.authority].flatMap(collectRoleLabels);
    }

    if (typeof value === "string" || typeof value === "number") {
        return [String(value)];
    }

    return [];
};

const hasEmployeeRole = (employee: NormalizedEmployee) => {
    const raw = employee.raw as Record<string, unknown>;
    const labels = [
        raw.role,
        raw.roleName,
        raw.userRole,
        raw.userRoleName,
        raw.roles,
        raw.roleNames,
        raw.authorities,
        raw.user,
    ].flatMap(collectRoleLabels);

    if (labels.length === 0) {
        return true;
    }

    return labels.some((label) => {
        const normalized = label.toLocaleUpperCase("tr-TR");
        return (
            normalized === "EMPLOYEE" ||
            normalized === "ROLE_EMPLOYEE" ||
            normalized === "ÇALIŞAN" ||
            normalized === "CALISAN" ||
            normalized === "ROLE_ÇALIŞAN" ||
            normalized === "ROLE_CALISAN"
        );
    });
};

const DepartmentsPage = () => {
    const [department, setDepartment] = useState<Department | null>(null);
    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [currentProfile, setCurrentProfile] = useState<EmployeeApiResponse | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [positionFilter, setPositionFilter] = useState("ALL");
    const [selectedEmployee, setSelectedEmployee] = useState<NormalizedEmployee | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;

        const loadData = async () => {
            setLoading(true);
            setError("");

            try {
                const [profile, departments, employeeList] = await Promise.all([
                    getMyProfile(),
                    getDepartments(),
                    getAllEmployees(),
                ]);

                if (!alive) return;

                const departmentId = Number(profile?.departmentId);
                const managerId = Number(profile?.id);
                const ownDepartment =
                    departments.find((item) => Number(item.id) === departmentId) ??
                    departments.find((item) => item.name === profile?.departmentName) ??
                    null;

                setCurrentProfile(profile);
                setDepartment(ownDepartment);
                setEmployees(
                    employeeList.filter((employee) => {
                        if (!hasEmployeeRole(employee)) {
                            return false;
                        }

                        if (Number.isFinite(managerId) && employee.id === managerId) {
                            return false;
                        }

                        if (Number.isFinite(departmentId) && departmentId > 0) {
                            return employee.organizationInfo.departmentId === departmentId;
                        }

                        return employee.organizationInfo.departmentName === profile?.departmentName;
                    })
                );
                setSelectedEmployee(null);
            } catch (loadError) {
                console.error(loadError);
                if (alive) setError("Departman bilgileri alınamadı.");
            } finally {
                if (alive) setLoading(false);
            }
        };

        void loadData();

        return () => {
            alive = false;
        };
    }, []);

    const toggleSelectedEmployee = (employee: NormalizedEmployee) => {
        setSelectedEmployee((current) => (current?.id === employee.id ? null : employee));
    };

    const activeEmployees = useMemo(() => employees.filter(isActiveEmployee), [employees]);
    const leaveEmployees = useMemo(
        () => employees.filter((employee) => (employee.status || "").toLocaleUpperCase("tr-TR").includes("LEAVE")),
        [employees]
    );
    const positions = useMemo(
        () =>
            Array.from(
                new Set(
                    employees
                        .map((employee) => employee.organizationInfo.positionName)
                        .filter((position) => position && position !== "Belirtilmemiş")
                )
            ),
        [employees]
    );

    const filteredEmployees = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase("tr-TR");

        return employees.filter((employee) => {
            const matchesSearch =
                !query ||
                [
                    employee.basicInfo.fullName,
                    employee.email,
                    employee.organizationInfo.positionName,
                    employee.status,
                ]
                    .join(" ")
                    .toLocaleLowerCase("tr-TR")
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && isActiveEmployee(employee)) ||
                (statusFilter === "LEAVE" && (employee.status || "").toLocaleUpperCase("tr-TR").includes("LEAVE"));

            const matchesPosition =
                positionFilter === "ALL" || employee.organizationInfo.positionName === positionFilter;

            return matchesSearch && matchesStatus && matchesPosition;
        });
    }, [employees, positionFilter, searchTerm, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [positionFilter, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
    const paginatedEmployees = useMemo(
        () => filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, filteredEmployees]
    );

    const managerName =
        currentProfile != null
            ? `${empty(currentProfile.firstName)} ${empty(currentProfile.lastName)}`.trim()
            : "Belirtilmemiş";

    const departmentDescription = department?.description || "Departman açıklaması bulunmuyor.";
    const departmentName = department?.name || empty(currentProfile?.departmentName);
    const subDepartmentNames =
        department?.subDepartments?.map((sub) => sub.name).filter(Boolean).join(", ") ||
        empty(currentProfile?.subDepartmentName);

    if (loading) {
        return (
            <div className="flex min-h-full items-center justify-center px-6 py-10 text-slate-300">
                Departman bilgileri yükleniyor...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-full items-center justify-center px-6 py-10 text-rose-300">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-full px-3 py-6 text-white sm:px-6">
            <div className="mx-auto grid max-w-none gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className="space-y-5">
                    <header>
                        <p className="text-sm text-slate-500">Çalışanlarım / Departmanım</p>
                        <div className="mt-2 flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-violet-300" />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">Departmanım</h1>
                                <p className="mt-1 text-2xl font-bold text-violet-300">{departmentName}</p>
                            </div>
                        </div>
                        <p className="mt-3 max-w-3xl text-sm text-slate-400">
                            Departmanınızdaki çalışanları görüntüleyebilir, iletişim bilgilerine ulaşabilir ve organizasyon bilgisini takip edebilirsiniz.
                        </p>
                    </header>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className={`${panelClass} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                                    <Users className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Toplam Çalışan</p>
                                    <p className="mt-1 text-3xl font-bold text-white">{employees.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${panelClass} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Aktif Çalışan</p>
                                    <p className="mt-1 text-3xl font-bold text-white">{activeEmployees.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${panelClass} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                                    <CalendarDays className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">İzinli Çalışan</p>
                                    <p className="mt-1 text-3xl font-bold text-white">{leaveEmployees.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${panelClass} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                                    <BriefcaseBusiness className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Pozisyon Çeşidi</p>
                                    <p className="mt-1 text-3xl font-bold text-white">{positions.length}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={`${panelClass} overflow-hidden`}>
                        <div className="grid gap-3 border-b border-white/10 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                            <label className="relative block">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Çalışan ara..."
                                    className={`${inputClass} h-12 pl-12`}
                                />
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className={`${inputClass} h-12`}
                            >
                                <option value="ALL">Durum: Tümü</option>
                                <option value="ACTIVE">Aktif</option>
                                <option value="LEAVE">İzinli</option>
                            </select>
                            <select
                                value={positionFilter}
                                onChange={(event) => setPositionFilter(event.target.value)}
                                className={`${inputClass} h-12`}
                            >
                                <option value="ALL">Pozisyon: Tümü</option>
                                {positions.map((position) => (
                                    <option key={position} value={position}>
                                        {position}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.9fr_0.7fr] border-b border-white/10 bg-slate-950/35 px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                            <span>Çalışan</span>
                            <span>Pozisyon</span>
                            <span>Durum</span>
                            <span>İşe Giriş Tarihi</span>
                            <span className="text-right">İşlemler</span>
                        </div>

                        {filteredEmployees.length === 0 ? (
                            <div className="px-5 py-14 text-center text-sm text-slate-400">
                                Departmanınızda bu kritere uygun çalışan bulunamadı.
                            </div>
                        ) : (
                            paginatedEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    onClick={() => toggleSelectedEmployee(employee)}
                                    className={`grid cursor-pointer grid-cols-[1.3fr_1fr_0.8fr_0.9fr_0.7fr] items-center gap-4 border-b border-white/10 px-5 py-4 text-sm last:border-b-0 hover:bg-slate-950/30 ${
                                        selectedEmployee?.id === employee.id ? "bg-sky-500/10" : ""
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-white">{employee.basicInfo.fullName}</p>
                                        <p className="mt-1 truncate text-xs text-slate-400">{employee.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                                            <BriefcaseBusiness className="h-5 w-5" />
                                        </span>
                                        <span className="truncate text-slate-200">{employee.organizationInfo.positionName}</span>
                                    </div>
                                    <span>
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                                                isActiveEmployee(employee)
                                                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                                    : "border-amber-400/20 bg-amber-500/10 text-amber-300"
                                            }`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            {isActiveEmployee(employee) ? "Aktif" : empty(employee.status)}
                                        </span>
                                    </span>
                                    <span className="text-slate-300">{formatDate(employee.hireDate)}</span>
                                    <span className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                toggleSelectedEmployee(employee);
                                            }}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-300 transition hover:bg-violet-500/20"
                                            title="Görüntüle"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <a
                                            href={`mailto:${employee.email}`}
                                            onClick={(event) => event.stopPropagation()}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300 transition hover:bg-indigo-500/20"
                                            title="E-posta"
                                        >
                                            <Mail className="h-4 w-4" />
                                        </a>
                                    </span>
                                </div>
                            ))
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400">
                            <span>Toplam {filteredEmployees.length} çalışan</span>
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
                    </section>
                </main>

                <aside className={`${panelClass} h-fit p-4 xl:sticky xl:top-6 ${selectedEmployee ? "xl:mt-16" : "xl:mt-10"}`}>
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="break-words text-lg font-bold text-white">{departmentName}</h2>
                                <span className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                                    Aktif
                                </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-400">{subDepartmentNames}</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        <div>
                            <p className="text-sm text-slate-400">Departman Yöneticisi</p>
                            <p className="mt-1 text-sm font-semibold text-white">{managerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Açıklama</p>
                            <p className="mt-1 text-sm leading-6 text-slate-200">{departmentDescription}</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Toplam Çalışan</span>
                            <strong className="text-white">{employees.length}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Pozisyon Çeşidi</span>
                            <strong className="text-white">{positions.length}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Aktif Çalışan</span>
                            <strong className="text-white">{activeEmployees.length}</strong>
                        </div>
                    </div>

                    {selectedEmployee && (
                        <>
                            <div className="mt-4 flex items-start gap-4 border-t border-white/10 pt-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="break-words text-lg font-bold text-white">{selectedEmployee.basicInfo.fullName}</h3>
                                        <span className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                                            {isActiveEmployee(selectedEmployee) ? "Aktif" : empty(selectedEmployee.status)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-400">{selectedEmployee.organizationInfo.positionName}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-sm text-slate-400">E-posta</p>
                                    <p className="mt-1 break-words text-sm font-semibold text-white">{selectedEmployee.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Telefon</p>
                                    <p className="mt-1 text-sm font-semibold text-white">{empty(selectedEmployee.phone)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">İşe Giriş Tarihi</p>
                                    <p className="mt-1 text-sm font-semibold text-white">{formatDate(selectedEmployee.hireDate)}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-400">Departman</span>
                                    <strong className="text-right text-white">{selectedEmployee.organizationInfo.departmentName}</strong>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-400">Alt Departman</span>
                                    <strong className="text-right text-white">{selectedEmployee.organizationInfo.subDepartmentName}</strong>
                                </div>
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default DepartmentsPage;
