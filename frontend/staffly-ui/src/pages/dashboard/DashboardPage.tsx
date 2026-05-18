import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarCheck,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileText,
    LifeBuoy,
    Mail,
    UserPlus,
    Users,
    WalletCards,
} from "lucide-react";

import { getDepartments } from "../../services/departmentService";
import { getAllEmployees, getMyProfile } from "../../services/employeeService";
import { getAllLeaves, getAnnualLeaveBalance, getEmployeeLeaves, type Leave, type LeaveBalance } from "../../services/leaveService";
import { getAllTasks, getMyTasks } from "../../services/taskService";
import { supportService } from "../../services/supportService";
import { getApplications } from "../../services/applicationService";
import { getMyPayrollOverview, type EmployeePayrollOverview } from "../../services/payrollService";
import { getCalendarEvents, getDepartmentEvents } from "../../services/workScheduleService";
import { getUsers, type User } from "../../services/userService";
import type { Department } from "../../types/departmentTypes";
import type { EmployeeApiResponse, NormalizedEmployee } from "../../types/employeeTypes";
import type { Ticket } from "../../types/ticket";
import type { CalendarEventResponse } from "../../types/workScheduleTypes";
import {
    getTokenRoles,
    ROLE_DEPARTMENT_MANAGER,
    ROLE_EMPLOYEE,
    ROLE_HR_MANAGER,
    ROLE_MANAGER,
    ROLE_SYSTEM_ADMIN,
} from "../../utils/auth";

type DashboardData = {
    profile: EmployeeApiResponse | null;
    employees: NormalizedEmployee[];
    departments: Department[];
    leaves: Leave[];
    tasks: unknown[];
    tickets: Ticket[];
    applications: unknown[];
    events: CalendarEventResponse[];
    users: User[];
    leaveBalance: LeaveBalance | null;
    payroll: EmployeePayrollOverview | null;
};

type StatCardProps = {
    title: string;
    value?: string | number | null;
    detail: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: "sky" | "violet" | "emerald" | "amber" | "rose" | "cyan";
};

type QuickAction = {
    label: string;
    path: string;
};

const panelClass = "rounded-2xl border border-white/10 bg-slate-900/45 shadow-[0_0_45px_rgba(15,23,42,0.42)]";
const toneClass = {
    sky: {
        card: "border-sky-400/25 bg-sky-500/10",
        icon: "bg-sky-500/15 text-sky-300 shadow-[0_0_32px_rgba(14,165,233,0.18)]",
        text: "text-sky-200",
    },
    violet: {
        card: "border-violet-400/25 bg-violet-500/10",
        icon: "bg-violet-500/15 text-violet-300 shadow-[0_0_32px_rgba(139,92,246,0.18)]",
        text: "text-violet-200",
    },
    emerald: {
        card: "border-emerald-400/25 bg-emerald-500/10",
        icon: "bg-emerald-500/15 text-emerald-300 shadow-[0_0_32px_rgba(16,185,129,0.18)]",
        text: "text-emerald-200",
    },
    amber: {
        card: "border-amber-400/25 bg-amber-500/10",
        icon: "bg-amber-500/15 text-amber-300 shadow-[0_0_32px_rgba(245,158,11,0.18)]",
        text: "text-amber-200",
    },
    rose: {
        card: "border-rose-400/25 bg-rose-500/10",
        icon: "bg-rose-500/15 text-rose-300 shadow-[0_0_32px_rgba(244,63,94,0.18)]",
        text: "text-rose-200",
    },
    cyan: {
        card: "border-cyan-400/25 bg-cyan-500/10",
        icon: "bg-cyan-500/15 text-cyan-300 shadow-[0_0_32px_rgba(6,182,212,0.18)]",
        text: "text-cyan-200",
    },
};

const safe = async <T,>(factory: () => Promise<T>, fallback: T): Promise<T> => {
    try {
        return await factory();
    } catch (error) {
        console.warn("Dashboard data source unavailable", error);
        return fallback;
    }
};

const asArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (value && typeof value === "object" && Array.isArray((value as { content?: unknown[] }).content)) {
        return (value as { content: T[] }).content;
    }
    return [];
};

const fullName = (employee?: EmployeeApiResponse | NormalizedEmployee | null) => {
    if (!employee) return "Kullanıcı";
    if ("basicInfo" in employee) return (employee as NormalizedEmployee).basicInfo.fullName;
    return `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || employee.email || "Kullanıcı";
};

const statusText = (value: unknown) => String(value ?? "").toLocaleUpperCase("tr-TR");
const isActive = (employee: NormalizedEmployee) => ["ACTIVE", "AKTIF", "AKTİF"].includes(statusText(employee.status));
const isPending = (status: unknown) => {
    const text = statusText(status);
    return text.includes("PENDING") || text.includes("WAIT") || text.includes("BEKLE") || text.includes("ONAY");
};
const isOpenTicket = (ticket: Ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(statusText(ticket.status));
const getTaskStatus = (task: unknown) => {
    const record = task as Record<string, unknown>;
    const nested = record.status && typeof record.status === "object" ? record.status as Record<string, unknown> : null;
    return String(record.statusName ?? record.statusTitle ?? record.state ?? record.status ?? nested?.name ?? "");
};
const getTaskTitle = (task: unknown, index: number) => {
    const record = task as Record<string, unknown>;
    return String(record.title ?? record.name ?? record.description ?? `Görev #${index + 1}`);
};
const getTaskDateValue = (task: unknown) => {
    const record = task as Record<string, unknown>;
    return String(record.dueDate ?? record.deadline ?? record.endDate ?? record.endDateTime ?? record.createdAt ?? "");
};
const getEmployeeRoles = (employee: NormalizedEmployee) => {
    const raw = employee.raw as Record<string, unknown>;
    const roleValue = raw.roleNames ?? raw.roles ?? raw.roleName ?? raw.role ?? "Çalışan";
    if (Array.isArray(roleValue)) {
        return roleValue
            .map((role) => (typeof role === "object" && role != null ? String((role as Record<string, unknown>).name ?? "") : String(role)))
            .filter(Boolean)
            .join(", ");
    }
    return String(roleValue || "Çalışan");
};
const leaveEmployeeName = (leave: Leave) =>
    leave.employeeFullName || `${leave.employeeFirstName ?? ""} ${leave.employeeLastName ?? ""}`.trim() || `Çalışan #${leave.employeeId}`;
const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(date);
};

const roleLabelText = (role: string) => {
    const normalized = role.replace(/^ROLE_/, "").toLocaleUpperCase("tr-TR");
    const labels: Record<string, string> = {
        SYSTEM_ADMIN: "Sistem Yöneticisi",
        HR_MANAGER: "HR Manager",
        DEPARTMENT_MANAGER: "Departman Yöneticisi",
        MANAGER: "Yönetici",
        EMPLOYEE: "Çalışan",
        ACCOUNTING: "Muhasebe",
    };
    return labels[normalized] ?? role.replace(/^ROLE_/, "");
};
const userRoleLabels = (user: User) => user.roles?.map((role) => roleLabelText(role.name)).join(", ") || "Rol yok";
const StatCard = ({ title, value, detail, icon: Icon, tone }: StatCardProps) => (
    <div className={`h-full min-h-[132px] rounded-2xl border p-5 ${toneClass[tone].card}`}>
        <div className="flex h-full items-center gap-5">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${toneClass[tone].icon}`}>
                <Icon className="h-7 w-7" />
            </div>
            <div className="flex min-h-[92px] min-w-0 flex-1 flex-col justify-center">
                <p className={`min-h-[20px] text-sm font-bold ${toneClass[tone].text}`}>{title}</p>
                {value != null && value !== "" && (
                    <p className="mt-1 min-h-[36px] text-3xl font-extrabold text-white">{value}</p>
                )}
                <p className={`${value != null && value !== "" ? "mt-1" : "mt-3"} min-h-[20px] text-sm text-slate-400`}>
                    {detail}
                </p>
            </div>
        </div>
    </div>
);

const MiniBar = ({ label, value, total, tone = "bg-sky-400" }: { label: string; value: number; total: number; tone?: string }) => {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between gap-4 text-sm">
                <span className="truncate text-slate-300">{label}</span>
                <span className="font-semibold text-white">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, percent)}%` }} />
            </div>
        </div>
    );
};

const Donut = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center gap-5">
        <div
            className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
            style={{ background: `conic-gradient(#38bdf8 ${value * 3.6}deg, #22c55e ${value * 2.2}deg, rgba(30,41,59,.9) 0deg)` }}
        >
            <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-950">
                <div className="text-center">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                </div>
            </div>
        </div>
    </div>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const roles = useMemo(() => getTokenRoles(), []);
    const [data, setData] = useState<DashboardData>({
        profile: null,
        employees: [],
        departments: [],
        leaves: [],
        tasks: [],
        tickets: [],
        applications: [],
        events: [],
        users: [],
        leaveBalance: null,
        payroll: null,
    });
    const [loading, setLoading] = useState(true);

    const roleType = useMemo(() => {
        if (roles.includes(ROLE_SYSTEM_ADMIN)) return "admin";
        if (roles.includes(ROLE_HR_MANAGER)) return "hr";
        if (roles.includes(ROLE_DEPARTMENT_MANAGER) || roles.includes(ROLE_MANAGER)) return "department";
        if (roles.includes(ROLE_EMPLOYEE)) return "employee";
        return "employee";
    }, [roles]);

    useEffect(() => {
        let alive = true;

        const load = async () => {
            setLoading(true);
            const profile = await safe(getMyProfile, null);
            const employeeId = Number(profile?.id);
            const profileDepartmentId = Number(profile?.departmentId);
            const isEmployeeDashboard = roleType === "employee";
            const startDateTime = new Date().toISOString();
            const endDateTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString();

            const [employees, departments, leaves, tasks, tickets, applications, events, users, leaveBalance, payroll] = await Promise.all([
                safe(getAllEmployees, []),
                safe(getDepartments, []),
                isEmployeeDashboard && Number.isFinite(employeeId) ? safe(() => getEmployeeLeaves(employeeId), []) : safe(getAllLeaves, []),
                isEmployeeDashboard ? safe(getMyTasks, []) : safe(getAllTasks, []),
                isEmployeeDashboard ? safe(supportService.getMyTickets, []) : safe(supportService.getAllTickets, []),
                roleType === "hr" || roleType === "admin" ? safe(getApplications, []) : Promise.resolve([]),
                roleType === "department" && Number.isFinite(profileDepartmentId)
                    ? safe(() => getDepartmentEvents(profileDepartmentId, startDateTime, endDateTime), [])
                    : safe(() => getCalendarEvents(startDateTime, endDateTime), []),
                roleType === "admin" ? safe(getUsers, []) : Promise.resolve([]),
                isEmployeeDashboard && Number.isFinite(employeeId) ? safe(() => getAnnualLeaveBalance(employeeId), null) : Promise.resolve(null),
                isEmployeeDashboard ? safe(getMyPayrollOverview, null) : Promise.resolve(null),
            ]);

            if (!alive) return;
            setData({
                profile,
                employees,
                departments,
                leaves,
                tasks: asArray(tasks),
                tickets,
                applications: asArray(applications),
                events,
                users,
                leaveBalance,
                payroll,
            });
            setLoading(false);
        };

        void load();

        return () => {
            alive = false;
        };
    }, [roleType]);

    const departmentId = Number(data.profile?.departmentId);
    const scopedEmployees = useMemo(() => {
        if (roleType !== "department") return data.employees;
        return data.employees.filter((employee) => employee.organizationInfo.departmentId === departmentId);
    }, [data.employees, departmentId, roleType]);

    const activeEmployees = scopedEmployees.filter(isActive);
    const pendingLeaves = data.leaves.filter((leave) => isPending(leave.status));
    const openTasks = data.tasks.filter((task) => !statusText(getTaskStatus(task)).includes("DONE") && !statusText(getTaskStatus(task)).includes("TAMAM"));
    const openTickets = data.tickets.filter(isOpenTicket);
    const departmentGroups = Array.from(
        scopedEmployees.reduce((map, employee) => {
            const key = employee.organizationInfo.departmentName || "Departman Yok";
            map.set(key, (map.get(key) ?? 0) + 1);
            return map;
        }, new Map<string, number>())
    ).sort((a, b) => b[1] - a[1]);

    const name = fullName(data.profile);
    const roleLabel = roleType === "admin" ? "Sistem Yöneticisi Paneli" : roleType === "hr" ? "HR Manager Dashboard" : roleType === "department" ? "Departman Yöneticisi Dashboard" : "Çalışan Dashboard";
    const greeting = `Hoş geldin, ${name}`;
    const adminQuickActions: QuickAction[] = [
        { label: "Yeni Kullanıcı", path: "/app/users" },
        { label: "Departman Ekle", path: "/app/departments/manage" },
        { label: "İş İlanı Oluştur", path: "/app/job-postings" },
        { label: "Toplantı Planla", path: "/app/meetings" },
        { label: "Çalışma Takvimi", path: "/app/work-schedules" },
        { label: "Maaş Ataması", path: "/app/payroll/salary-assignment" },
        { label: "Avans Talepleri", path: "/app/payroll/advance-requests" },
        { label: "İzin Talepleri", path: "/app/leaveService" },
    ];
    const hrQuickActions: QuickAction[] = [
        { label: "Yeni Çalışan Ekle", path: "/app/employees/create" },
        { label: "İş İlanı Oluştur", path: "/app/job-postings" },
        { label: "Kullanıcı Hesabı Aç", path: "/app/employees/create" },
        { label: "Departmana Ata", path: "/app/employees" },
        { label: "Toplantı Oluştur", path: "/app/meetings" },
        { label: "İzin Talepleri Oluştur", path: "/app/leaveService?view=create" },
    ];
    const departmentQuickActions: QuickAction[] = [
        { label: "Görev Ata", path: "/app/tasks" },
        { label: "Mesai Planı Oluştur", path: "/app/work-schedules" },
        { label: "İzin Onayla", path: "/app/leaveService?view=approval" },
        { label: "Toplantı Oluştur", path: "/app/meetings" },
        { label: "Duyuru Gönder", path: "/app/support" },
    ];
    const employeeQuickActions: QuickAction[] = [
        { label: "İzin Talebi Oluştur", path: "/app/leaveService?view=create" },
        { label: "Destek Talebi Aç", path: "/app/support" },
    ];

    if (loading) {
        return <div className="flex min-h-full items-center justify-center text-slate-300">Dashboard yükleniyor...</div>;
    }

    const commonStats =
        roleType === "employee"
            ? [
                  { title: "Aktif Görev", value: openTasks.length, detail: "Size atanan açık görev", icon: ClipboardList, tone: "sky" as const },
                  { title: "İzin Bakiyem", value: `${Math.round(data.leaveBalance?.remainingDays ?? 0)} Gün`, detail: "Yıllık ücretli izin", icon: CalendarCheck, tone: "cyan" as const },
                  { title: "Destek Taleplerim", value: data.tickets.length, detail: `${openTickets.length} açık talep`, icon: LifeBuoy, tone: "violet" as const },
                  { title: "Bordro Durumu", value: null, detail: data.payroll?.lastNetSalary ? `Son net: ₺${data.payroll.lastNetSalary}` : "Son net maaş bulunmuyor", icon: WalletCards, tone: "amber" as const },
              ]
            : [
                  { title: roleType === "admin" ? "Toplam Kullanıcı" : "Çalışanlar", value: scopedEmployees.length, detail: `${activeEmployees.length} aktif çalışan`, icon: Users, tone: "sky" as const },
                  { title: "Toplam Departman", value: data.departments.length, detail: `${data.departments.filter((department) => !department.deleted).length} aktif departman`, icon: Building2, tone: "emerald" as const },
                  ...(roleType === "department" ? [] : [{ title: roleType === "hr" ? "İşe Alım" : "Açık Görevler", value: roleType === "hr" ? data.applications.length : openTasks.length, detail: roleType === "hr" ? "Mevcut başvuru" : `${data.tasks.length} toplam görev`, icon: BriefcaseBusiness, tone: "violet" as const }]),
                  { title: "Bekleyen İzin", value: pendingLeaves.length, detail: "Onay bekleyen talep", icon: CalendarCheck, tone: "amber" as const },
                  { title: "Açık Destek", value: openTickets.length, detail: `${data.tickets.length} toplam talep`, icon: LifeBuoy, tone: "rose" as const },
              ];
    const statGridClass =
        roleType === "employee" || roleType === "department"
            ? "md:grid-cols-2 xl:grid-cols-4"
            : "md:grid-cols-2 xl:grid-cols-5";

    return (
        <div className="min-w-0 overflow-x-hidden space-y-5 px-3 pb-8 pt-5 text-white sm:px-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
                    <p className="mt-1 text-sm text-slate-400">{roleLabel}</p>
                </div>
            </header>

            <section className={`grid gap-4 ${statGridClass}`}>
                {commonStats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </section>

            {roleType === "admin" && (
                <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <section className={`${panelClass} min-w-0 p-5`}>
                        <h2 className="text-lg font-bold">Kullanıcı ve Departman Dağılımı</h2>
                        <div className="mt-5 grid gap-5 md:grid-cols-[150px_1fr]">
                            <Donut value={Math.min(100, data.departments.length * 4)} label="Departman" />
                            <div className="space-y-4">
                                {departmentGroups.slice(0, 5).map(([department, count], index) => (
                                    <MiniBar key={department} label={department} value={count} total={scopedEmployees.length} tone={["bg-sky-400", "bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-cyan-400"][index] ?? "bg-sky-400"} />
                                ))}
                            </div>
                        </div>
                    </section>
                    <RecentPeople employees={data.employees} title="Son Eklenen Kullanıcılar" />
                    <QuickPanel actions={adminQuickActions} onNavigate={navigate} />
                </div>
            )}

            {roleType === "hr" && (
                <div className="grid gap-5 xl:grid-cols-[1fr_1fr_360px]">
                    <ApplicationsPanel applications={data.applications} />
                    <LeavePanel leaves={pendingLeaves} title="Bekleyen İzin Talepleri" />
                    <QuickPanel actions={hrQuickActions} onNavigate={navigate} />
                </div>
            )}

            {roleType === "department" && (
                <div className="grid gap-5 xl:grid-cols-[1fr_1fr_340px]">
                    <section className={`${panelClass} p-5`}>
                        <h2 className="text-lg font-bold">Ekibim - Genel Bakış</h2>
                        <div className="mt-5 flex items-center gap-6">
                            <Donut value={scopedEmployees.length} label="Çalışan" />
                            <div className="flex-1 space-y-4">
                                {departmentGroups.slice(0, 5).map(([department, count]) => (
                                    <MiniBar key={department} label={department} value={count} total={scopedEmployees.length} />
                                ))}
                            </div>
                        </div>
                    </section>
                    <LeavePanel leaves={pendingLeaves} title="Bekleyen İzin Talepleri" />
                    <QuickPanel actions={departmentQuickActions} onNavigate={navigate} />
                </div>
            )}

            {roleType === "employee" && (
                <div className="grid gap-5 xl:grid-cols-[0.85fr_0.85fr_360px]">
                    <TaskPanel tasks={data.tasks} title="Görevlerim" />
                    <UsedLeavesPanel leaves={data.leaves} />
                    <QuickPanel actions={employeeQuickActions} onNavigate={navigate} />
                </div>
            )}

            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                {roleType === "admin" ? (
                    <RecentUsersTable users={data.users} employees={data.employees} />
                ) : roleType === "department" ? (
                    <EventsPanel events={data.events} />
                ) : roleType === "employee" ? (
                    <UpcomingTaskPanel tasks={data.tasks} />
                ) : roleType === "hr" ? (
                    <div className="grid gap-5 md:grid-cols-2">
                        <ApplicationsPanel applications={data.applications} />
                        <LeavePanel leaves={pendingLeaves} title="Bekleyen İzin Talepleri" />
                    </div>
                ) : (
                    <TaskPanel tasks={data.tasks} title="Görev Dağılımı" />
                )}
                <ActivityPanel leaves={data.leaves} tickets={data.tickets} applications={data.applications} />
            </div>
        </div>
    );
};

const RecentPeople = ({ employees, title }: { employees: NormalizedEmployee[]; title: string }) => (
    <section className={`${panelClass} min-w-0 overflow-hidden`}>
        <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="divide-y divide-white/10">
            {employees.slice(0, 5).map((employee) => (
                <div key={employee.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{employee.basicInfo.fullName}</p>
                        <p className="truncate text-xs text-slate-400">{employee.organizationInfo.positionName}</p>
                    </div>
                    <span className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                        {isActive(employee) ? "Aktif" : employee.status}
                    </span>
                </div>
            ))}
        </div>
    </section>
);

const LeavePanel = ({ leaves, title }: { leaves: Leave[]; title: string }) => (
    <section className={`${panelClass} overflow-hidden`}>
        <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="divide-y divide-white/10">
            {leaves.slice(0, 5).map((leave) => (
                <div key={leave.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                    <div>
                        <p className="font-semibold text-white">{leaveEmployeeName(leave)}</p>
                        <p className="text-xs text-slate-400">{formatDate(leave.startDatetime)} - {formatDate(leave.endDatetime)}</p>
                    </div>
                    <span className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">{leave.totalDays ?? 1} gün</span>
                </div>
            ))}
            {leaves.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">Bekleyen talep bulunmuyor.</div>}
        </div>
    </section>
);

const TaskPanel = ({ tasks, title }: { tasks: unknown[]; title: string }) => (
    <section className={`${panelClass} overflow-hidden`}>
        <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="divide-y divide-white/10">
            {tasks.slice(0, 5).map((task, index) => (
                <div key={String((task as Record<string, unknown>).id ?? index)} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{getTaskTitle(task, index)}</p>
                        <p className="truncate text-xs text-slate-400">{getTaskStatus(task) || "Durum belirtilmemiş"}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-sky-300" />
                </div>
            ))}
            {tasks.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">Görev bulunmuyor.</div>}
        </div>
    </section>
);

const UpcomingTaskPanel = ({ tasks }: { tasks: unknown[] }) => (
    <section className={`${panelClass} overflow-hidden`}>
        <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">Yaklaşan Görevler</h2>
        </div>
        <div className="divide-y divide-white/10">
            {tasks.slice(0, 5).map((task, index) => (
                <div key={String((task as Record<string, unknown>).id ?? index)} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                    <p className="truncate font-semibold text-white">{getTaskTitle(task, index)}</p>
                    <span className="text-slate-400">{formatDate(getTaskDateValue(task))}</span>
                </div>
            ))}
            {tasks.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">Yaklaşan görev bulunmuyor.</div>}
        </div>
    </section>
);

const EventsPanel = ({ events }: { events: CalendarEventResponse[] }) => (
    <section className={`${panelClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">Yaklaşan Etkinlikler</h2>
            <span className="text-xs font-semibold text-sky-300">Tümünü Gör</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-sm text-sky-300">
            <span>‹</span>
            <span className="font-semibold">{new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date())}</span>
            <span>›</span>
        </div>
        <div className="divide-y divide-white/10 px-4 py-2">
            {events.slice(0, 5).map((event) => (
                <div key={event.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-xl px-2 py-3 text-sm hover:bg-slate-950/30">
                    <div className="text-center">
                        <p className="text-lg font-bold text-sky-300">{new Date(event.startDateTime).getDate()}</p>
                        <p className="text-[0.65rem] uppercase text-slate-500">
                            {new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(new Date(event.startDateTime))}
                        </p>
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{event.title}</p>
                        <p className="truncate text-xs text-slate-400">
                            {new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.startDateTime))} - {new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.endDateTime))}
                        </p>
                    </div>
                    <span className="rounded-lg border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-xs text-sky-300">{event.eventType}</span>
                </div>
            ))}
            {events.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">Yaklaşan etkinlik bulunmuyor.</div>}
        </div>
    </section>
);

const RecentUsersTable = ({ users, employees }: { users: User[]; employees: NormalizedEmployee[] }) => (
    <section className={`${panelClass} min-w-0 overflow-hidden`}>
        <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">Son Eklenen Kullanıcılar</h2>
        </div>
        <div className="grid min-w-[640px] grid-cols-[1fr_1.2fr_1fr_0.8fr_0.7fr] gap-4 border-b border-white/10 bg-slate-950/35 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span>Kullanıcı</span>
            <span>E-posta</span>
            <span>Rol</span>
            <span>Oluşturulma</span>
            <span>Durum</span>
        </div>
        <div className="divide-y divide-white/10 overflow-x-auto">
            {(users.length ? users : employees.map((employee) => ({ email: employee.email, active: isActive(employee), employeeId: employee.id, roles: [] }))).slice(0, 6).map((user) => {
                const employee = employees.find((item) => item.id === user.employeeId || item.email === user.email);
                return (
                    <div key={user.email} className="grid min-w-[640px] grid-cols-[1fr_1.2fr_1fr_0.8fr_0.7fr] gap-4 px-5 py-3 text-sm">
                        <span className="truncate font-semibold text-white">{employee?.basicInfo.fullName ?? user.email}</span>
                        <span className="truncate text-slate-300">{user.email}</span>
                        <span className="truncate text-slate-300">{user.roles?.length ? userRoleLabels(user) : employee ? getEmployeeRoles(employee) : "Rol yok"}</span>
                        <span className="text-slate-400">{formatDate(employee?.createdAt)}</span>
                        <span className={user.active ? "text-emerald-300" : "text-rose-300"}>{user.active ? "Aktif" : "Pasif"}</span>
                    </div>
                );
            })}
        </div>
    </section>
);

const ApplicationsPanel = ({ applications }: { applications: unknown[] }) => (
    <section className={`${panelClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">Yeni Başvurular</h2>
            <span className="text-xs font-semibold text-sky-300">Tümünü Gör</span>
        </div>
        <div className="divide-y divide-white/10">
            {applications.slice(0, 5).map((application, index) => {
                const record = application as Record<string, unknown>;
                const name = String(record.fullName ?? record.candidateName ?? record.name ?? `Aday #${index + 1}`);
                const position = String(record.positionName ?? record.jobTitle ?? record.position ?? "Pozisyon belirtilmemiş");
                return (
                    <div key={String(record.id ?? index)} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{name}</p>
                            <p className="truncate text-xs text-slate-400">{position}</p>
                        </div>
                        <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">Yeni</span>
                    </div>
                );
            })}
            {applications.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">Yeni başvuru bulunmuyor.</div>}
        </div>
    </section>
);

const UsedLeavesPanel = ({ leaves }: { leaves: Leave[] }) => (
    <section className={`${panelClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold">İzinlerim</h2>
            <span className="text-xs font-semibold text-sky-300">Detaylar</span>
        </div>
        <div className="divide-y divide-white/10">
            {leaves.slice(0, 5).map((leave) => (
                <div key={leave.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{leave.leaveTypeName}</p>
                        <p className="truncate text-xs text-slate-400">{formatDate(leave.startDatetime)} - {formatDate(leave.endDatetime)}</p>
                    </div>
                    <span className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-xs text-violet-300">{leave.totalDays ?? 1} gün</span>
                </div>
            ))}
            {leaves.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">Kullanılmış izin bulunmuyor.</div>}
        </div>
    </section>
);
const QuickPanel = ({ actions, onNavigate }: { actions: QuickAction[]; onNavigate: (path: string) => void }) => (
    <section className={`${panelClass} p-5`}>
        <h2 className="text-lg font-bold">Hızlı İşlemler</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
            {actions.map((action, index) => {
                const Icon = [UserPlus, CalendarDays, Users, Mail, FileText, BarChart3][index % 6];
                return (
                    <button
                        key={action.label}
                        type="button"
                        onClick={() => onNavigate(action.path)}
                        className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-center text-xs font-semibold text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-500/10"
                    >
                        <Icon className="h-6 w-6 text-sky-300" />
                        {action.label}
                    </button>
                );
            })}
        </div>
    </section>
);

const ActivityPanel = ({ leaves, tickets, applications }: { leaves: Leave[]; tickets: Ticket[]; applications: unknown[] }) => (
    <section className={`${panelClass} p-5`}>
        <h2 className="text-lg font-bold">Son Aktiviteler</h2>
        <div className="mt-4 space-y-3">
            <ActivityRow icon={CalendarCheck} text={`${leaves.length} izin talebi sistemde kayıtlı`} />
            <ActivityRow icon={LifeBuoy} text={`${tickets.length} destek talebi takip ediliyor`} />
            <ActivityRow icon={BriefcaseBusiness} text={`${applications.length} başvuru mevcut`} />
        </div>
    </section>
);

const ActivityRow = ({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) => (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/30 px-3 py-3 text-sm text-slate-300">
        <Icon className="h-5 w-5 text-sky-300" />
        <span>{text}</span>
        <Clock3 className="ml-auto h-4 w-4 text-slate-500" />
    </div>
);

export default DashboardPage;

