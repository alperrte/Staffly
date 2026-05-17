import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    CalendarCheck,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    Filter,
    Loader2,
    Plane,
    Save,
    Send,
    X,
    XCircle,
} from "lucide-react";

import { getAllEmployees, getMyProfile } from "../../services/employeeService";
import { getUsers, type User } from "../../services/userService";
import type { NormalizedEmployee } from "../../types/employeeTypes";
import {
    createLeave,
    getAllLeaves,
    getAnnualLeaveBalance,
    getEmployeeLeaves,
    getLeaveTypes,
    reviewLeave,
    updateAnnualLeaveQuota,
    type Leave,
    type LeaveBalance,
    type LeaveType,
} from "../../services/leaveService";
import {
    getTokenUserId,
    hasAnyRole,
    ROLE_DEPARTMENT_MANAGER,
    ROLE_HR_MANAGER,
    ROLE_SYSTEM_ADMIN,
} from "../../utils/auth";

type ViewMode = "create" | "mine" | "approval" | "quota";
type ReviewAction = "APPROVED" | "REJECTED";
type EmployeeRoleGroup = "HR" | "DEPARTMENT_MANAGER" | "OTHER";
type DateField = "start" | "end";

const DAILY_WORK_HOURS = 8;

const timeSlots = Array.from({ length: 21 }, (_, index) => {
    const totalMinutes = 8 * 60 + index * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const statusMeta: Record<
    string,
    {
        label: string;
        badge: string;
        icon: typeof Clock3;
        iconBox: string;
    }
> = {
    PENDING: {
        label: "Beklemede",
        badge: "border-amber-400/20 bg-amber-500/12 text-amber-300",
        icon: Clock3,
        iconBox: "bg-violet-500/15 text-violet-300",
    },
    APPROVED: {
        label: "Onaylandı",
        badge: "border-emerald-400/20 bg-emerald-500/12 text-emerald-300",
        icon: CheckCircle2,
        iconBox: "bg-emerald-500/15 text-emerald-300",
    },
    REJECTED: {
        label: "Reddedildi",
        badge: "border-rose-400/20 bg-rose-500/12 text-rose-300",
        icon: XCircle,
        iconBox: "bg-rose-500/15 text-rose-300",
    },
    CANCELLED: {
        label: "İptal Edildi",
        badge: "border-slate-400/20 bg-slate-500/12 text-slate-300",
        icon: XCircle,
        iconBox: "bg-slate-500/15 text-slate-300",
    },
    ALL: {
        label: "Tümü",
        badge: "border-sky-400/20 bg-sky-500/12 text-sky-300",
        icon: CalendarDays,
        iconBox: "bg-sky-500/15 text-sky-300",
    },
};

const normalizeStatus = (status?: string) => (status || "PENDING").toUpperCase();
const statusSortOrder: Record<string, number> = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
};

const formatName = (name?: string) =>
    (name || "İzin")
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("izin", "izni")
        .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("tr-TR"));

const toDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value?: string | null) => {
    const date = toDate(value);
    if (!date) return "Belirtilmemiş";

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        weekday: "long",
    }).format(date);
};

const formatDateTime = (value?: string | null) => {
    const date = toDate(value);
    if (!date) return "Belirtilmemiş";

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const toInputDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseInputDate = (value?: string | null) => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
};

const calculateHours = (start?: string | null, end?: string | null) => {
    const startDate = toDate(start);
    const endDate = toDate(end);
    if (!startDate || !endDate) return 0;

    return Math.max((endDate.getTime() - startDate.getTime()) / 3_600_000, 0);
};

const calculateDays = (leave: Pick<Leave, "startDatetime" | "endDatetime" | "totalDays" | "totalHours">) => {
    if (leave.totalDays && leave.totalDays > 0) return leave.totalDays;
    if (leave.totalHours && leave.totalHours > 0) return Math.max(0.5, leave.totalHours / DAILY_WORK_HOURS);

    const start = toDate(leave.startDatetime);
    const end = toDate(leave.endDatetime);
    if (!start || !end) return 0;

    if (start.toDateString() === end.toDateString() && calculateHours(leave.startDatetime, leave.endDatetime) > 0) {
        return Math.max(0.5, calculateHours(leave.startDatetime, leave.endDatetime) / DAILY_WORK_HOURS);
    }

    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.floor(diff / 86_400_000) + 1);
};

const formatRemainingQuota = (hours: number) => {
    const safeHours = Math.max(hours, 0);
    const days = Math.floor(safeHours / DAILY_WORK_HOURS);
    const remainingHours = safeHours % DAILY_WORK_HOURS;

    if (remainingHours === 0) return `${days} gün`;
    return `${days} gün ${remainingHours} saat`;
};

const formatDuration = (leave: Leave) => {
    const hours = leave.totalHours || calculateHours(leave.startDatetime, leave.endDatetime);
    const isHourly = leave.leaveTypeName?.toUpperCase().includes("YARIM") || (hours > 0 && hours < 8);

    if (isHourly) {
        const formattedHours = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(".", ",");
        return `${formattedHours} saat`;
    }

    const days = calculateDays(leave);
    const formattedDays = Number.isInteger(days) ? String(days) : days.toFixed(1).replace(".", ",");
    return `${formattedDays} gün`;
};

const getCurrentEmployeeId = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userEmployeeId = Number(user?.employeeId);
        if (Number.isFinite(userEmployeeId) && userEmployeeId > 0) return userEmployeeId;
    } catch {
        // localStorage user is optional in this app.
    }

    return getTokenUserId() || 1;
};

const timeValue = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
};

const employeeLabel = (leave: Leave) => {
    const name = leave.employeeFullName || [leave.employeeFirstName, leave.employeeLastName].filter(Boolean).join(" ");
    return name.trim() || `Çalışan #${leave.employeeId}`;
};

const normalizeRoleName = (role?: string) => {
    if (!role) return "";
    return role.startsWith("ROLE_") ? role : `ROLE_${role}`;
};

const StatCard = ({
    label,
    count,
    days,
    status,
}: {
    label: string;
    count: number;
    days: number;
    status: string;
}) => {
    const meta = statusMeta[status] ?? statusMeta.PENDING;
    const Icon = meta.icon;

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_35px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${meta.iconBox}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-300">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{count}</p>
                    <p className="text-sm text-slate-400">Toplam gün: {days}</p>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const normalized = normalizeStatus(status);
    const meta = statusMeta[normalized] ?? {
        label: status || "Bilinmiyor",
        badge: "border-white/10 bg-white/5 text-slate-300",
        icon: Clock3,
        iconBox: "",
    };
    const Icon = meta.icon;

    return (
        <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${meta.badge}`}>
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
        </span>
    );
};

const LeaveServicePage = () => {
    const canReview = hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER]);
    const canManageQuota = hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_DEPARTMENT_MANAGER]);
    const isSystemAdmin = hasAnyRole([ROLE_SYSTEM_ADMIN]);
    const isHrManager = hasAnyRole([ROLE_HR_MANAGER]);
    const isDepartmentManager = hasAnyRole([ROLE_DEPARTMENT_MANAGER]);
    const [employeeId, setEmployeeId] = useState(() => getCurrentEmployeeId());
    const [searchParams, setSearchParams] = useSearchParams();

    const requestedView = searchParams.get("view") as ViewMode | null;
    const activeView: ViewMode =
        requestedView === "approval" && canReview
            ? "approval"
            : requestedView === "quota" && canManageQuota
                ? "quota"
                : requestedView === "mine" || requestedView === "create"
                ? requestedView
                : "create";

    const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
    const [approvalLeaves, setApprovalLeaves] = useState<Leave[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [annualBalance, setAnnualBalance] = useState<LeaveBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [reviewTarget, setReviewTarget] = useState<{ leave: Leave; action: ReviewAction } | null>(null);
    const [detailLeave, setDetailLeave] = useState<Leave | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [filters, setFilters] = useState({
        status: "ALL",
        leaveType: "ALL",
        search: "",
    });
    const [formData, setFormData] = useState({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "13:00",
        reason: "",
    });
    const [activeDateField, setActiveDateField] = useState<DateField>("start");
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [quotaForm, setQuotaForm] = useState({
        employeeId: String(employeeId),
        quotaDays: "",
    });

    useEffect(() => {
        let alive = true;

        getMyProfile()
            .then((profile) => {
                const profileEmployeeId = Number(profile?.id);
                if (alive && Number.isFinite(profileEmployeeId) && profileEmployeeId > 0) {
                    setEmployeeId(profileEmployeeId);
                    setQuotaForm((current) => ({
                        ...current,
                        employeeId: current.employeeId || String(profileEmployeeId),
                    }));
                }
            })
            .catch(() => undefined);

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if ((requestedView === "approval" && !canReview) || (requestedView === "quota" && !canManageQuota)) {
            setSearchParams({ view: "create" });
        }
    }, [canManageQuota, canReview, requestedView, setSearchParams]);

    const selectedLeaveType = leaveTypes.find((type) => String(type.id) === formData.leaveTypeId);
    const annualLeaveType = leaveTypes.find((type) => type.name?.toUpperCase().includes("YILLIK"));
    const isHalfDayLeave = Boolean(
        selectedLeaveType?.isHourly || selectedLeaveType?.name?.toUpperCase().includes("YARIM")
    );
    const today = toInputDate(new Date());
    const userByEmployeeId = useMemo(() => {
        const map = new Map<number, User>();

        users.forEach((user) => {
            if (user.employeeId != null) {
                map.set(Number(user.employeeId), user);
            }
        });

        employees.forEach((employee) => {
            if (!map.has(employee.id)) {
                const user = users.find((item) => item.email?.toLowerCase() === employee.email?.toLowerCase());
                if (user) {
                    map.set(employee.id, user);
                }
            }
        });

        return map;
    }, [employees, users]);

    const employeeById = useMemo(() => {
        const map = new Map<number, NormalizedEmployee>();
        employees.forEach((employee) => {
            map.set(employee.id, employee);
        });
        return map;
    }, [employees]);

    const getLeaveEmployeeLabel = useCallback(
        (leave: Leave) => {
            const responseName = employeeLabel(leave);
            if (!responseName.startsWith("Çalışan #")) {
                return responseName;
            }

            const employee = employeeById.get(leave.employeeId);
            return employee?.basicInfo.fullName || `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim() || responseName;
        },
        [employeeById]
    );

    const getEmployeeRoleGroup = useCallback(
        (targetEmployeeId: number): EmployeeRoleGroup => {
            const roleNames = userByEmployeeId
                .get(targetEmployeeId)
                ?.roles?.map((role) => normalizeRoleName(role.name)) ?? [];

            if (roleNames.includes(ROLE_HR_MANAGER)) return "HR";
            if (roleNames.includes(ROLE_DEPARTMENT_MANAGER)) return "DEPARTMENT_MANAGER";
            return "OTHER";
        },
        [userByEmployeeId]
    );

    const canManageEmployee = useCallback(
        (targetEmployeeId: number) => {
            if (!isSystemAdmin && targetEmployeeId === employeeId) return false;
            if (isSystemAdmin) return true;
            const targetRoleGroup = getEmployeeRoleGroup(targetEmployeeId);

            if (isHrManager) return targetRoleGroup !== "HR";
            if (isDepartmentManager) return targetRoleGroup !== "DEPARTMENT_MANAGER";

            return false;
        },
        [employeeId, getEmployeeRoleGroup, isDepartmentManager, isHrManager, isSystemAdmin]
    );

    const quotaEmployees = useMemo(
        () => employees.filter((employee) => canManageEmployee(employee.id)),
        [canManageEmployee, employees]
    );

    useEffect(() => {
        if (!canManageQuota || quotaEmployees.length === 0) return;

        const currentEmployeeId = Number(quotaForm.employeeId);
        if (!quotaEmployees.some((employee) => employee.id === currentEmployeeId)) {
            setQuotaForm((current) => ({ ...current, employeeId: String(quotaEmployees[0].id) }));
        }
    }, [canManageQuota, quotaEmployees, quotaForm.employeeId]);

    useEffect(() => {
        const targetEmployeeId = Number(quotaForm.employeeId);
        if (activeView !== "quota" || !Number.isFinite(targetEmployeeId) || targetEmployeeId <= 0 || !canManageEmployee(targetEmployeeId)) {
            return;
        }

        let cancelled = false;

        getAnnualLeaveBalance(targetEmployeeId)
            .then((balance) => {
                if (!cancelled) {
                    setQuotaForm((current) => ({
                        ...current,
                        quotaDays: balance.quotaDays == null ? "" : String(balance.quotaDays),
                    }));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setQuotaForm((current) => ({ ...current, quotaDays: "" }));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeView, canManageEmployee, quotaForm.employeeId]);

    useEffect(() => {
        if (isHalfDayLeave && formData.startDate && formData.endDate !== formData.startDate) {
            setFormData((current) => ({ ...current, endDate: current.startDate }));
        }
        if (isHalfDayLeave && activeDateField === "end") {
            setActiveDateField("start");
        }
    }, [activeDateField, formData.endDate, formData.startDate, isHalfDayLeave]);

    useEffect(() => {
        if (timeValue(formData.endTime) <= timeValue(formData.startTime)) {
            const nextSlot = timeSlots.find((slot) => timeValue(slot) > timeValue(formData.startTime));
            if (nextSlot) {
                setFormData((current) => ({ ...current, endTime: nextSlot }));
            }
        }
    }, [formData.endTime, formData.startTime]);

    const selectedHours = isHalfDayLeave
        ? Math.max((timeValue(formData.endTime) - timeValue(formData.startTime)) / 60, 0)
        : 0;

    const selectedDays = useMemo(() => {
        if (!formData.startDate || !formData.endDate) return 0;
        if (isHalfDayLeave) return Math.max(selectedHours / 8, 0);

        return calculateDays({
            startDatetime: `${formData.startDate}T00:00:00`,
            endDatetime: `${formData.endDate}T00:00:00`,
            totalDays: null,
            totalHours: null,
        });
    }, [formData.endDate, formData.startDate, isHalfDayLeave, selectedHours]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - startOffset);

        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);
            return {
                date,
                value: toInputDate(date),
                isCurrentMonth: date.getMonth() === calendarMonth.getMonth(),
                isWeekend: date.getDay() === 0 || date.getDay() === 6,
            };
        });
    }, [calendarMonth]);

    const calendarTitle = useMemo(
        () =>
            new Intl.DateTimeFormat("tr-TR", {
                month: "long",
                year: "numeric",
            }).format(calendarMonth),
        [calendarMonth]
    );

    const showDateOnCalendar = (field: DateField) => {
        const date = parseInputDate(field === "start" ? formData.startDate : formData.endDate) ?? parseInputDate(formData.startDate) ?? new Date();
        setActiveDateField(field);
        setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    const selectCalendarDate = (dateValue: string) => {
        if (dateValue < today) return;

        setFormData((current) => {
            if (activeDateField === "start") {
                return {
                    ...current,
                    startDate: dateValue,
                    endDate: isHalfDayLeave || !current.endDate || current.endDate < dateValue ? dateValue : current.endDate,
                };
            }

            if (!current.startDate) {
                return {
                    ...current,
                    startDate: dateValue,
                    endDate: dateValue,
                };
            }

            if (dateValue < current.startDate) return current;

            return {
                ...current,
                endDate: isHalfDayLeave ? current.startDate : dateValue,
            };
        });

        if (activeDateField === "start" && !isHalfDayLeave) {
            setActiveDateField("end");
        }
    };

    const loadData = useCallback(async () => {
        setError("");
        setLoading(true);

        try {
            const shouldLoadManagementData = canReview || canManageQuota;
            const [types, employeeLeaves, allLeaves, balance, employeeList, userList] = await Promise.all([
                getLeaveTypes(),
                getEmployeeLeaves(employeeId),
                canReview ? getAllLeaves() : Promise.resolve([]),
                getAnnualLeaveBalance(employeeId),
                shouldLoadManagementData ? getAllEmployees() : Promise.resolve([]),
                shouldLoadManagementData ? getUsers() : Promise.resolve([]),
            ]);

            setLeaveTypes(types);
            setMyLeaves(employeeLeaves);
            setApprovalLeaves(allLeaves);
            setAnnualBalance(balance);
            setEmployees(employeeList);
            setUsers(userList);
            setQuotaForm((current) => ({
                employeeId: current.employeeId || String(employeeId),
                quotaDays: balance.quotaDays == null ? "" : String(balance.quotaDays),
            }));
        } catch (loadError) {
            console.error(loadError);
            setError("İzin verileri alınamadı.");
        } finally {
            setLoading(false);
        }
    }, [canManageQuota, canReview, employeeId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const myStats = useMemo(() => {
        const quota = annualBalance?.quotaDays;
        const remainingDays = annualBalance?.remainingDays;
        const remainingHours = annualBalance?.remainingHours ?? 0;

        if (quota == null || remainingDays == null) {
            return {
                quota: null,
                remaining: null,
            };
        }

        return {
            quota,
            remaining: formatRemainingQuota(remainingDays * DAILY_WORK_HOURS + remainingHours),
        };
    }, [annualBalance]);

    const manageableApprovalLeaves = useMemo(
        () => approvalLeaves.filter((leave) => canManageEmployee(leave.employeeId)),
        [approvalLeaves, canManageEmployee]
    );

    const statsSource = activeView === "approval" ? manageableApprovalLeaves : myLeaves;
    const stats = useMemo(() => {
        const byStatus = (status: string) => statsSource.filter((leave) => normalizeStatus(leave.status) === status);
        const days = (items: Leave[]) => items.reduce((total, leave) => total + calculateDays(leave), 0);
        const pending = byStatus("PENDING");
        const approved = byStatus("APPROVED");
        const rejected = byStatus("REJECTED");

        return {
            pending: { count: pending.length, days: days(pending) },
            approved: { count: approved.length, days: days(approved) },
            rejected: { count: rejected.length, days: days(rejected) },
            all: { count: statsSource.length, days: days(statsSource) },
        };
    }, [statsSource]);

    const filteredLeaves = useMemo(() => {
        const source = activeView === "approval" ? manageableApprovalLeaves : myLeaves;
        const query = filters.search.trim().toLowerCase();

        return source
            .filter((leave) => {
                const statusMatch = filters.status === "ALL" || normalizeStatus(leave.status) === filters.status;
                const typeMatch = filters.leaveType === "ALL" || leave.leaveTypeName === filters.leaveType;
                const searchMatch =
                    !query ||
                    [
                        getLeaveEmployeeLabel(leave),
                        leave.employeeId,
                        leave.leaveTypeName,
                        leave.status,
                        formatDate(leave.startDatetime),
                        formatDate(leave.endDatetime),
                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(query);

                return statusMatch && typeMatch && searchMatch;
            })
            .sort((first, second) => {
                const firstOrder = statusSortOrder[normalizeStatus(first.status)] ?? 99;
                const secondOrder = statusSortOrder[normalizeStatus(second.status)] ?? 99;

                return firstOrder - secondOrder;
            });
    }, [activeView, filters, getLeaveEmployeeLabel, manageableApprovalLeaves, myLeaves]);

    const submitLeave = async () => {
        if (!formData.leaveTypeId || !formData.startDate || !formData.endDate) {
            setError("Lütfen izin türü ve tarih aralığını doldurun.");
            return;
        }

        if (formData.endDate < formData.startDate) {
            setError("Bitiş tarihi başlangıç tarihinden önce olamaz.");
            return;
        }

        if (isHalfDayLeave && timeValue(formData.endTime) <= timeValue(formData.startTime)) {
            setError("Bitiş saati başlangıç saatinden önce veya aynı olamaz.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await createLeave({
                employeeId,
                leaveTypeId: Number(formData.leaveTypeId),
                startDatetime: isHalfDayLeave ? `${formData.startDate}T${formData.startTime}:00` : `${formData.startDate}T00:00:00`,
                endDatetime: isHalfDayLeave ? `${formData.startDate}T${formData.endTime}:00` : `${formData.endDate}T00:00:00`,
                reason: formData.reason || "İzin talebi",
            });

            setFormData({
                leaveTypeId: "",
                startDate: "",
                endDate: "",
                startTime: "09:00",
                endTime: "13:00",
                reason: "",
            });
            setSuccess("İzin talebiniz oluşturuldu.");
            setSearchParams({ view: "mine" });
            await loadData();
        } catch (submitError) {
            console.error(submitError);
            setError("İzin talebi oluşturulamadı.");
        } finally {
            setSaving(false);
        }
    };

    const saveQuota = async () => {
        const targetEmployeeId = Number(quotaForm.employeeId);
        const quotaDays = Number(quotaForm.quotaDays);

        if (!quotaForm.quotaDays.trim() || !Number.isFinite(targetEmployeeId) || targetEmployeeId <= 0 || !Number.isFinite(quotaDays) || quotaDays < 0) {
            setError("Lütfen geçerli çalışan ve kota bilgisi girin.");
            return;
        }

        if (!canManageEmployee(targetEmployeeId)) {
            setError("Bu çalışanın yıllık izin kotasını güncelleme yetkiniz yok.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const updated = await updateAnnualLeaveQuota(targetEmployeeId, quotaDays);
            if (targetEmployeeId === employeeId) {
                setAnnualBalance(updated);
            }
            setSuccess("Yıllık izin kotası güncellendi.");
        } catch (quotaError) {
            console.error(quotaError);
            setError("Yıllık izin kotası güncellenemedi.");
        } finally {
            setSaving(false);
        }
    };

    const submitReview = async () => {
        if (!reviewTarget) return;
        const reviewedLeave = reviewTarget.leave;

        if (reviewTarget.action === "REJECTED" && !rejectReason.trim()) {
            setError("Reddetme nedeni zorunludur.");
            return;
        }

        if (!canManageEmployee(reviewedLeave.employeeId)) {
            setError("Bu izin talebini onaylama veya reddetme yetkiniz yok.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await reviewLeave({
                leaveRequestId: reviewedLeave.id,
                managerId: employeeId,
                action: reviewTarget.action,
                comment: reviewTarget.action === "APPROVED" ? "Onaylandı" : rejectReason.trim(),
            });

            if (reviewedLeave.employeeId === employeeId) {
                const updatedBalance = await getAnnualLeaveBalance(employeeId);
                setAnnualBalance(updatedBalance);
            }

            setSuccess(reviewTarget.action === "APPROVED" ? "İzin talebi onaylandı." : "İzin talebi reddedildi.");
            setReviewTarget(null);
            setRejectReason("");
            await loadData();
        } catch (reviewError) {
            console.error(reviewError);
            setError("İzin talebi güncellenemedi.");
        } finally {
            setSaving(false);
        }
    };

    const resetFilters = () => {
        setFilters({
            status: "ALL",
            leaveType: "ALL",
            search: "",
        });
    };

    const renderActions = (leave: Leave) => {
        const isPending = normalizeStatus(leave.status) === "PENDING";

        if (activeView !== "approval" || !isPending || !canManageEmployee(leave.employeeId)) {
            return (
                <button
                    type="button"
                    onClick={() => setDetailLeave(leave)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-500/35 bg-violet-500/10 px-4 text-sm font-semibold text-violet-200"
                >
                    <Eye className="h-4 w-4" />
                    Detay
                </button>
            );
        }

        return (
            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setReviewTarget({ leave, action: "APPROVED" })}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/15 text-emerald-300 transition hover:bg-emerald-500/25"
                    title="Onayla"
                >
                    <Check className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => setReviewTarget({ leave, action: "REJECTED" })}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/15 text-rose-300 transition hover:bg-rose-500/25"
                    title="Reddet"
                >
                    <X className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => setDetailLeave(leave)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/15 text-violet-300 transition hover:bg-violet-500/25"
                    title="Detay"
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        );
    };

    const selectedDuration = isHalfDayLeave
        ? `${selectedHours ? selectedHours.toString().replace(".", ",") : 0} saat`
        : `${selectedDays || 0} gün`;

    return (
        <div className="min-h-full bg-[#020817] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1540px] space-y-5">
                <header className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_0_45px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:p-7">
                    <div>
                        <p className="text-sm font-semibold text-sky-300">İzin Yönetimi</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            {activeView === "create" && "Yeni İzin Talebi Oluştur"}
                            {activeView === "mine" && "İzin Taleplerim"}
                            {activeView === "approval" && "İzin Taleplerini Yönet"}
                            {activeView === "quota" && "Yıllık İzin Kotası"}
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-400">
                            {activeView === "create" && "İzin bilgilerinizi girin ve talebinizi yöneticinize gönderin."}
                            {activeView === "mine" && "Oluşturduğunuz izin taleplerini görüntüleyebilir ve durumlarını takip edebilirsiniz."}
                            {activeView === "approval" && "HR ve departman yöneticileri bekleyen izin taleplerini onaylayabilir veya neden girerek reddedebilir."}
                            {activeView === "quota" && "Yetkiniz olan çalışanların yıllık izin kotasını belirleyebilirsiniz."}
                        </p>
                    </div>

                    {(error || success) && (
                        <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${error ? "border-rose-400/25 bg-rose-500/10 text-rose-200" : "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"}`}>
                            {error || success}
                        </div>
                    )}
                </header>

                {activeView === "create" && (
                    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.75fr)]">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-7">
                            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">1</span>
                                <h2 className="text-xl font-bold text-white">İzin Bilgileri</h2>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-2">
                                <label className="block lg:col-span-2">
                                    <span className="text-sm font-medium text-slate-300">İzin Türü *</span>
                                    <div className="relative mt-2">
                                        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-300" />
                                        <select
                                            value={formData.leaveTypeId}
                                            onChange={(event) =>
                                                setFormData((current) => ({
                                                    ...current,
                                                    leaveTypeId: event.target.value,
                                                    endDate:
                                                        leaveTypes.find((type) => String(type.id) === event.target.value)?.isHourly && current.startDate
                                                            ? current.startDate
                                                            : current.endDate,
                                                }))
                                            }
                                            className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-slate-900/70 pl-12 pr-12 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                        >
                                            <option value="">İzin türü seçin</option>
                                            {leaveTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {formatName(type.name)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-300">Başlangıç Tarihi *</span>
                                    <button
                                        type="button"
                                        onClick={() => showDateOnCalendar("start")}
                                        className={`mt-2 flex h-14 w-full items-center justify-between rounded-2xl border bg-slate-900/70 px-4 text-left text-sm font-semibold outline-none transition ${
                                            activeDateField === "start" ? "border-violet-400/70 text-white" : "border-white/10 text-white hover:border-violet-400/45"
                                        }`}
                                    >
                                        <span>{formData.startDate ? formatDate(`${formData.startDate}T00:00:00`) : "Tarih seçin"}</span>
                                        <CalendarDays className="h-4 w-4 text-violet-300" />
                                    </button>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-300">Bitiş Tarihi *</span>
                                    <button
                                        type="button"
                                        disabled={isHalfDayLeave}
                                        onClick={() => showDateOnCalendar("end")}
                                        className={`mt-2 flex h-14 w-full items-center justify-between rounded-2xl border bg-slate-900/70 px-4 text-left text-sm font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            activeDateField === "end" ? "border-violet-400/70 text-white" : "border-white/10 text-white hover:border-violet-400/45"
                                        }`}
                                    >
                                        <span>{formData.endDate ? formatDate(`${formData.endDate}T00:00:00`) : "Tarih seçin"}</span>
                                        <CalendarDays className="h-4 w-4 text-violet-300" />
                                    </button>
                                </label>

                                {isHalfDayLeave && (
                                    <>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-300">Başlangıç Saati *</span>
                                            <select
                                                value={formData.startTime}
                                                onChange={(event) => setFormData((current) => ({ ...current, startTime: event.target.value }))}
                                                className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                            >
                                                {timeSlots.slice(0, -1).map((slot) => (
                                                    <option key={slot} value={slot}>
                                                        {slot}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-300">Bitiş Saati *</span>
                                            <select
                                                value={formData.endTime}
                                                onChange={(event) => setFormData((current) => ({ ...current, endTime: event.target.value }))}
                                                className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                            >
                                                {timeSlots
                                                    .filter((slot) => timeValue(slot) > timeValue(formData.startTime))
                                                    .map((slot) => (
                                                        <option key={slot} value={slot}>
                                                            {slot}
                                                        </option>
                                                    ))}
                                            </select>
                                        </label>
                                    </>
                                )}

                                <label className="block lg:col-span-2">
                                    <span className="text-sm font-medium text-slate-300">Açıklama</span>
                                    <textarea
                                        value={formData.reason}
                                        maxLength={500}
                                        onChange={(event) => setFormData((current) => ({ ...current, reason: event.target.value }))}
                                        placeholder="Talebinizle ilgili açıklama giriniz..."
                                        className="mt-2 min-h-40 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/70"
                                    />
                                    <p className="mt-2 text-right text-xs text-slate-500">{formData.reason.length}/500</p>
                                </label>
                            </div>

                            <div className="mt-7 flex justify-end border-t border-white/10 pt-6">
                                <button
                                    type="button"
                                    onClick={submitLeave}
                                    disabled={saving}
                                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-bold text-white shadow-[0_0_26px_rgba(124,58,237,0.3)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Talebi Gönder
                                </button>
                            </div>
                        </div>

                        <aside className="space-y-5">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">İzin Takvimi Önizleme</h3>
                                            <p className="mt-1 text-xs font-semibold text-violet-300">
                                                {activeDateField === "start" ? "Başlangıç tarihi seçiliyor" : "Bitiş tarihi seçiliyor"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/70 text-slate-300 transition hover:border-violet-400/45 hover:text-white"
                                        title="Önceki ay"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <p className="text-sm font-bold capitalize text-white">{calendarTitle}</p>
                                    <button
                                        type="button"
                                        onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/70 text-slate-300 transition hover:border-violet-400/45 hover:text-white"
                                        title="Sonraki ay"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-slate-500">
                                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                                        <span key={day} className="py-1">
                                            {day}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-2 grid grid-cols-7 gap-1">
                                    {calendarDays.map((day) => {
                                        const disabled =
                                            day.value < today ||
                                            (activeDateField === "end" && Boolean(formData.startDate) && day.value < formData.startDate);
                                        const isStart = day.value === formData.startDate;
                                        const isEnd = day.value === formData.endDate;
                                        const inRange =
                                            Boolean(formData.startDate && formData.endDate) &&
                                            day.value > formData.startDate &&
                                            day.value < formData.endDate;

                                        return (
                                            <button
                                                key={day.value}
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => selectCalendarDate(day.value)}
                                                className={`flex aspect-square items-center justify-center rounded-xl text-xs font-bold transition ${
                                                    isStart || isEnd
                                                        ? "bg-violet-600 text-white shadow-[0_0_18px_rgba(124,58,237,0.35)]"
                                                        : inRange
                                                            ? "bg-violet-500/20 text-violet-100"
                                                            : day.isWeekend
                                                                ? "text-slate-500"
                                                                : "text-slate-200"
                                                } ${
                                                    day.isCurrentMonth ? "" : "opacity-35"
                                                } ${
                                                    disabled
                                                        ? "cursor-not-allowed opacity-25"
                                                        : "hover:bg-violet-500/25 hover:text-white"
                                                }`}
                                            >
                                                {day.date.getDate()}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                                        Seçili aralık
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                                        Hafta sonu
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                                        <CalendarCheck className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">İzin Bakiye Bilgileri</h3>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-white/10 pb-4 text-slate-300">
                                        <span>Yıllık izin kotası</span>
                                        <strong className="text-white">{myStats.quota == null ? "Girilmedi" : `${myStats.quota} gün`}</strong>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Kalan yıllık izin</span>
                                        <strong className="text-lg text-violet-300">{myStats.remaining == null ? "Girilmedi" : myStats.remaining}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-5 text-center shadow-[0_0_45px_rgba(124,58,237,0.2)]">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/40 text-violet-100">
                                    <CalendarDays className="h-7 w-7" />
                                </div>
                                <p className="text-sm text-slate-300">Seçilen Tarih Aralığı</p>
                                <p className="mt-3 text-3xl font-black text-white">{selectedDuration}</p>
                                <p className="mt-3 text-sm text-slate-300">
                                    {formData.startDate ? formatDate(`${formData.startDate}T00:00:00`) : "Başlangıç seçilmedi"}
                                </p>
                                <p className="text-slate-500">-</p>
                                <p className="text-sm text-slate-300">
                                    {formData.endDate ? formatDate(`${formData.endDate}T00:00:00`) : "Bitiş seçilmedi"}
                                </p>
                                {isHalfDayLeave && (
                                    <p className="mt-2 text-sm text-slate-300">
                                        {formData.startTime} - {formData.endTime}
                                    </p>
                                )}
                                <p className="mt-4 text-xs text-slate-500">{selectedLeaveType ? formatName(selectedLeaveType.name) : "İzin türü seçilmedi"}</p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 text-sm leading-7 text-slate-400">
                                <p className="font-semibold text-white">Bilgilendirme</p>
                                <p className="mt-2">Talebiniz yöneticiniz tarafından değerlendirilecek ve sonucu sistem üzerinden takip edebileceksiniz.</p>
                            </div>
                        </aside>
                    </section>
                )}

                {activeView === "quota" && (
                    <section className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-7">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                                <Save className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Yıllık İzin Kotası Oluştur</h2>
                                <p className="mt-1 text-sm text-slate-400">Çalışan seçip yıllık izin gün kotasını belirleyin.</p>
                            </div>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="grid gap-5 md:grid-cols-3">
                                <label className="block">
                                    <span className="text-sm font-medium text-slate-300">Çalışan *</span>
                                    <select
                                        value={quotaForm.employeeId}
                                        onChange={(event) => setQuotaForm((current) => ({ ...current, employeeId: event.target.value }))}
                                        className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                    >
                                        {quotaEmployees.length === 0 ? (
                                            <option value="">Yetkili çalışan bulunamadı</option>
                                        ) : (
                                            quotaEmployees.map((employee) => (
                                                <option key={employee.id} value={employee.id}>
                                                    {employee.basicInfo.fullName || `${employee.firstName} ${employee.lastName}`.trim() || `Çalışan #${employee.id}`}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-300">İzin Türü *</span>
                                    <select
                                        value={annualLeaveType?.id ?? ""}
                                        onChange={() => undefined}
                                        className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                    >
                                        <option value={annualLeaveType?.id ?? ""}>{annualLeaveType ? formatName(annualLeaveType.name) : "Yıllık İzin"}</option>
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-300">Yıllık İzin Kotası *</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={quotaForm.quotaDays}
                                        onChange={(event) => setQuotaForm((current) => ({ ...current, quotaDays: event.target.value }))}
                                        className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                    />
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={saveQuota}
                                disabled={saving || quotaEmployees.length === 0}
                                className="inline-flex h-14 items-center justify-center gap-2 self-end rounded-2xl bg-sky-600 px-6 text-sm font-bold text-white shadow-[0_0_26px_rgba(14,165,233,0.25)] transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Kotayı Kaydet
                            </button>
                        </div>
                    </section>
                )}

                {activeView !== "create" && activeView !== "quota" && (
                    <section className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <StatCard label="Bekleyen" count={stats.pending.count} days={stats.pending.days} status="PENDING" />
                            <StatCard label="Onaylanan" count={stats.approved.count} days={stats.approved.days} status="APPROVED" />
                            <StatCard label="Reddedilen" count={stats.rejected.count} days={stats.rejected.days} status="REJECTED" />
                            <StatCard label="Tümü" count={stats.all.count} days={stats.all.days} status="ALL" />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 shadow-[0_0_35px_rgba(15,23,42,0.35)]">
                            <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_auto]">
                                <label>
                                    <span className="text-xs text-slate-400">Durum</span>
                                    <select
                                        value={filters.status}
                                        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                                        className="mt-1 h-12 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                    >
                                        <option value="ALL">Tümü</option>
                                        <option value="PENDING">Beklemede</option>
                                        <option value="APPROVED">Onaylandı</option>
                                        <option value="REJECTED">Reddedildi</option>
                                    </select>
                                </label>
                                <label>
                                    <span className="text-xs text-slate-400">İzin Türü</span>
                                    <select
                                        value={filters.leaveType}
                                        onChange={(event) => setFilters((current) => ({ ...current, leaveType: event.target.value }))}
                                        className="mt-1 h-12 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 text-sm font-semibold text-white outline-none focus:border-violet-400/70"
                                    >
                                        <option value="ALL">Tümü</option>
                                        {leaveTypes.map((type) => (
                                            <option key={type.id} value={type.name}>
                                                {formatName(type.name)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span className="text-xs text-slate-400">Arama</span>
                                    <input
                                        value={filters.search}
                                        onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                                        placeholder="İzin türü, durum, kişi, tarih..."
                                        className="mt-1 h-12 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-violet-400/70"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-5 text-sm font-bold text-slate-200 transition hover:bg-slate-800"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filtreleri Temizle
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 shadow-[0_0_45px_rgba(15,23,42,0.4)]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px]">
                                    <thead className="border-b border-white/10 bg-slate-950/70 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                        <tr>
                                            {activeView === "approval" && <th className="px-5 py-4">Çalışan</th>}
                                            <th className="px-5 py-4">İzin Türü</th>
                                            <th className="px-5 py-4">Tarih Aralığı</th>
                                            <th className="px-5 py-4">Toplam</th>
                                            <th className="px-5 py-4">Durum</th>
                                            <th className="px-5 py-4">Oluşturulma Tarihi</th>
                                            <th className="px-5 py-4 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={activeView === "approval" ? 7 : 6} className="px-5 py-12 text-center text-slate-400">
                                                    Veriler yükleniyor...
                                                </td>
                                            </tr>
                                        ) : filteredLeaves.length === 0 ? (
                                            <tr>
                                                <td colSpan={activeView === "approval" ? 7 : 6} className="px-5 py-12 text-center text-slate-400">
                                                    Kayıt bulunamadı.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeaves.map((leave) => (
                                                <tr key={leave.id} className="transition hover:bg-slate-900/55">
                                                    {activeView === "approval" && (
                                                        <td className="px-5 py-4">
                                                            <div className="font-semibold text-white">{getLeaveEmployeeLabel(leave)}</div>
                                                            <div className="text-xs text-slate-500">Personel kaydı</div>
                                                        </td>
                                                    )}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                                                                <Plane className="h-5 w-5" />
                                                            </div>
                                                            <span className="font-bold text-white">{formatName(leave.leaveTypeName)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-200">
                                                        <div>{formatDate(leave.startDatetime)}</div>
                                                        <div className="mt-1">{formatDate(leave.endDatetime)}</div>
                                                    </td>
                                                    <td className="px-5 py-4 font-bold text-white">{formatDuration(leave)}</td>
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={leave.status} />
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-200">{formatDateTime(leave.createdAt)}</td>
                                                    <td className="px-5 py-4 text-right">{renderActions(leave)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center border-t border-white/10 px-5 py-4 text-sm text-slate-400">
                                <span>Toplam {filteredLeaves.length} kayıt</span>
                            </div>
                        </div>
                    </section>
                )}

                {detailLeave && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-[0_0_60px_rgba(0,0,0,0.55)]">
                            <h3 className="text-xl font-bold text-white">İzin Detayı</h3>
                            <div className="mt-5 space-y-4 text-sm">
                                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                    <span className="text-slate-400">İzin türü</span>
                                    <strong className="text-white">{formatName(detailLeave.leaveTypeName)}</strong>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                    <span className="text-slate-400">Durum</span>
                                    <StatusBadge status={detailLeave.status} />
                                </div>
                                <div>
                                    <span className="text-slate-400">İzin alma sebebi</span>
                                    <p className="mt-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4 leading-6 text-slate-100">
                                        {detailLeave.reason?.trim() || "Sebep belirtilmemiş."}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setDetailLeave(null)}
                                    className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {reviewTarget && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-[0_0_60px_rgba(0,0,0,0.55)]">
                            <h3 className="text-xl font-bold text-white">
                                {reviewTarget.action === "APPROVED" ? "İzin talebini onayla" : "İzin talebini reddet"}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                                {formatName(reviewTarget.leave.leaveTypeName)} talebi için işlem yapılacak.
                            </p>

                            {reviewTarget.action === "REJECTED" && (
                                <label className="mt-5 block">
                                    <span className="text-sm font-semibold text-slate-300">Reddetme nedeni *</span>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(event) => setRejectReason(event.target.value)}
                                        className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-rose-400/70"
                                        placeholder="Reddetme nedenini giriniz..."
                                    />
                                </label>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReviewTarget(null);
                                        setRejectReason("");
                                    }}
                                    className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="button"
                                    onClick={submitReview}
                                    disabled={saving}
                                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${reviewTarget.action === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"}`}
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {reviewTarget.action === "APPROVED" ? "Onayla" : "Reddet"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveServicePage;
