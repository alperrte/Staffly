import { useEffect, useMemo, useState } from "react";
import {
    activateDepartmentWorkSchedule,
    cancelOvertime,
    createBulkOvertime,
    createBulkWorkSchedule,
    createDepartmentWorkSchedule,
    createOvertime,
    deactivateDepartmentWorkSchedule,
    getDepartmentOvertimes,
    getDepartmentWorkSchedules,
    getDepartments,
    getEmployees,
    updateDepartmentWorkSchedule,
    updateOvertime,
} from "../../services/workScheduleService";

import type {
    DepartmentResponse,
    DepartmentWorkScheduleResponse,
    EmployeeResponse,
    OvertimeResponse,
    WorkModel,
} from "../../types/workScheduleTypes";

const inputClass =
    "w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed [&>option]:bg-slate-950 [&>option]:text-slate-100";

const buttonClass =
    "rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold px-5 py-3 text-sm transition shadow-lg";

const secondaryButtonClass =
    "rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-5 py-3 text-sm transition";

const dangerButtonClass =
    "rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold px-4 py-2 text-xs transition";

const cardClass =
    "rounded-[28px] border border-slate-800 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]";

const workModelLabels: Record<WorkModel, string> = {
    OFFICE: "Ofis",
    HOME_OFFICE: "Home Office",
    HYBRID: "Hibrit",
    REMOTE: "Remote",
    DAY_OFF: "Tatil",
};

const timeOptions = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00",
];

const workDays = [
    { key: "monday", label: "Pazartesi", offset: 0 },
    { key: "tuesday", label: "Salı", offset: 1 },
    { key: "wednesday", label: "Çarşamba", offset: 2 },
    { key: "thursday", label: "Perşembe", offset: 3 },
    { key: "friday", label: "Cuma", offset: 4 },
] as const;

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getMonday = (date: Date) => {
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    current.setDate(diff);
    return current;
};

const addDays = (dateString: string, days: number) => {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() + days);
    return formatDate(date);
};

const WorkScheduleManagementPage = () => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [departmentWorkSchedules, setDepartmentWorkSchedules] = useState<DepartmentWorkScheduleResponse[]>([]);
    const [overtimes, setOvertimes] = useState<OvertimeResponse[]>([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const today = useMemo(() => formatDate(new Date()), []);
    const currentMonday = useMemo(() => formatDate(getMonday(new Date())), []);

    const [activeTab, setActiveTab] = useState<"department-hours" | "weekly-plan" | "overtime">("department-hours");

    const [departmentHourModalOpen, setDepartmentHourModalOpen] = useState(false);
    const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);
    const [bulkOvertimeModalOpen, setBulkOvertimeModalOpen] = useState(false);

    const [selectedDepartmentHourId, setSelectedDepartmentHourId] = useState<number | null>(null);
    const [selectedOvertimeId, setSelectedOvertimeId] = useState<number | null>(null);

    const [departmentHourForm, setDepartmentHourForm] = useState({
        departmentId: "",
        startTime: "",
        endTime: "",
        breakStartTime: "",
        breakEndTime: "",
    });

    const [weeklyPlanForm, setWeeklyPlanForm] = useState({
        departmentId: "",
        dayDates: {
            monday: currentMonday,
            tuesday: addDays(currentMonday, 1),
            wednesday: addDays(currentMonday, 2),
            thursday: addDays(currentMonday, 3),
            friday: addDays(currentMonday, 4),
        },
        dayModels: {
            monday: "OFFICE" as WorkModel,
            tuesday: "OFFICE" as WorkModel,
            wednesday: "OFFICE" as WorkModel,
            thursday: "OFFICE" as WorkModel,
            friday: "OFFICE" as WorkModel,
        },
    });

    const [overtimeForm, setOvertimeForm] = useState({
        employeeId: "",
        departmentId: "",
        overtimeDate: today,
        startTime: "",
        endTime: "",
        reason: "",
    });

    const [bulkOvertimeForm, setBulkOvertimeForm] = useState({
        departmentId: "",
        overtimeDate: today,
        startTime: "",
        endTime: "",
        reason: "",
    });

    const [overtimeFilter, setOvertimeFilter] = useState({
        departmentId: "",
        startDate: currentMonday,
        endDate: addDays(currentMonday, 4),
    });

    const workModels: WorkModel[] = ["OFFICE", "HOME_OFFICE", "HYBRID", "REMOTE", "DAY_OFF"];
    const visibleDepartmentWorkSchedules = useMemo(() => {
        const grouped = new Map<number, DepartmentWorkScheduleResponse[]>();

        departmentWorkSchedules.forEach((item) => {
            const list = grouped.get(item.departmentId) || [];
            list.push(item);
            grouped.set(item.departmentId, list);
        });

        return Array.from(grouped.values()).map((items) => {
            const activeItem = items.find((item) => item.active);
            return activeItem || items[items.length - 1];
        });
    }, [departmentWorkSchedules]);
    const tabClass = (tab: typeof activeTab) =>
        `rounded-xl px-5 py-3 text-sm font-semibold border transition ${
            activeTab === tab
                ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-transparent shadow-md"
                : "bg-[#050b18] text-slate-400 border-slate-800 hover:text-slate-100 hover:border-slate-600"
        }`;

    const showSuccess = (text: string) => {
        setMessage(text);
        setError("");
    };

    const showError = (err: any, fallback: string) => {
        setMessage("");
        setError(err?.response?.data?.message || fallback);
    };

    const loadInitialData = async () => {
        try {
            const [employeeData, departmentData, departmentScheduleData] = await Promise.all([
                getEmployees(),
                getDepartments(),
                getDepartmentWorkSchedules(),
            ]);

            setEmployees(employeeData);
            setDepartments(departmentData);
            setDepartmentWorkSchedules(departmentScheduleData);
        } catch {
            setError("Veriler yüklenirken hata oluştu.");
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const getDepartmentName = (departmentId?: number | null) => {
        if (!departmentId) return "Departman yok";
        return departments.find((item) => item.id === departmentId)?.name || `Departman #${departmentId}`;
    };

    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((item) => item.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : `Çalışan #${employeeId}`;
    };

    const resetDepartmentHourForm = () => {
        setSelectedDepartmentHourId(null);
        setDepartmentHourForm({
            departmentId: "",
            startTime: "",
            endTime: "",
            breakStartTime: "",
            breakEndTime: "",
        });
    };

    const openCreateDepartmentHourModal = () => {
        resetDepartmentHourForm();
        setDepartmentHourModalOpen(true);
    };

    const closeDepartmentHourModal = () => {
        resetDepartmentHourForm();
        setDepartmentHourModalOpen(false);
    };

    const openEditDepartmentHourModal = (item: DepartmentWorkScheduleResponse) => {
        setSelectedDepartmentHourId(item.id);
        setDepartmentHourForm({
            departmentId: String(item.departmentId),
            startTime: item.startTime.slice(0, 5),
            endTime: item.endTime.slice(0, 5),
            breakStartTime: item.breakStartTime ? item.breakStartTime.slice(0, 5) : "",
            breakEndTime: item.breakEndTime ? item.breakEndTime.slice(0, 5) : "",
        });
        setDepartmentHourModalOpen(true);
    };

    const handleCreateOrUpdateDepartmentHour = async () => {
        try {
            const payload = {
                departmentId: Number(departmentHourForm.departmentId),
                startTime: `${departmentHourForm.startTime}:00`,
                endTime: `${departmentHourForm.endTime}:00`,
                breakStartTime: departmentHourForm.breakStartTime ? `${departmentHourForm.breakStartTime}:00` : undefined,
                breakEndTime: departmentHourForm.breakEndTime ? `${departmentHourForm.breakEndTime}:00` : undefined,
            };

            if (selectedDepartmentHourId) {
                await updateDepartmentWorkSchedule(selectedDepartmentHourId, payload);
                showSuccess("Departman çalışma saati güncellendi.");
            } else {
                await createDepartmentWorkSchedule(payload);
                showSuccess("Departman çalışma saati oluşturuldu.");
            }

            closeDepartmentHourModal();
            setDepartmentWorkSchedules(await getDepartmentWorkSchedules());
        } catch (err) {
            showError(err, "Departman çalışma saati kaydedilemedi.");
        }
    };

    const handleDeactivateDepartmentHour = async (id: number) => {
        try {
            await deactivateDepartmentWorkSchedule(id);
            showSuccess("Departman çalışma saati pasife alındı.");
            setDepartmentWorkSchedules(await getDepartmentWorkSchedules());
        } catch (err) {
            showError(err, "Departman çalışma saati pasife alınamadı.");
        }
    };

    const handleActivateDepartmentHour = async (item: DepartmentWorkScheduleResponse) => {
        try {
            await activateDepartmentWorkSchedule(item.id);

            showSuccess("Departman çalışma saati tekrar aktif yapıldı.");
            setDepartmentWorkSchedules(await getDepartmentWorkSchedules());
        } catch (err) {
            showError(err, "Departman çalışma saati aktif yapılamadı.");
        }
    };

    const handleSaveWeeklyPlan = async () => {
        try {
            if (!weeklyPlanForm.departmentId) {
                setError("Haftalık plan için departman seçmelisin.");
                return;
            }

            for (const day of workDays) {
                const workDate = weeklyPlanForm.dayDates[day.key];

                await createBulkWorkSchedule({
                    departmentId: Number(weeklyPlanForm.departmentId),
                    startDate: workDate,
                    endDate: workDate,
                    workModel: weeklyPlanForm.dayModels[day.key],
                });
            }

            showSuccess("Departman gün bazlı haftalık planı kaydedildi.");
        } catch (err) {
            showError(err, "Haftalık plan kaydedilemedi.");
        }
    };

    const resetOvertimeForm = () => {
        setSelectedOvertimeId(null);
        setOvertimeForm({
            employeeId: "",
            departmentId: "",
            overtimeDate: today,
            startTime: "",
            endTime: "",
            reason: "",
        });
    };

    const openCreateOvertimeModal = () => {
        resetOvertimeForm();
        setOvertimeModalOpen(true);
    };

    const closeOvertimeModal = () => {
        resetOvertimeForm();
        setOvertimeModalOpen(false);
    };

    const openEditOvertimeModal = (overtime: OvertimeResponse) => {
        setSelectedOvertimeId(overtime.id);
        setOvertimeForm({
            employeeId: String(overtime.employeeId),
            departmentId: overtime.departmentId ? String(overtime.departmentId) : "",
            overtimeDate: overtime.overtimeDate,
            startTime: overtime.startTime.slice(0, 5),
            endTime: overtime.endTime.slice(0, 5),
            reason: overtime.reason || "",
        });
        setOvertimeModalOpen(true);
    };

    const handleEmployeeSelectForOvertime = (employeeId: string) => {
        const employee = employees.find((item) => item.id === Number(employeeId));

        setOvertimeForm({
            ...overtimeForm,
            employeeId,
            departmentId: employee?.departmentId ? String(employee.departmentId) : "",
        });
    };

    const handleCreateOrUpdateOvertime = async () => {
        try {
            const payload = {
                employeeId: Number(overtimeForm.employeeId),
                departmentId: overtimeForm.departmentId ? Number(overtimeForm.departmentId) : null,
                overtimeDate: overtimeForm.overtimeDate,
                startTime: `${overtimeForm.startTime}:00`,
                endTime: `${overtimeForm.endTime}:00`,
                reason: overtimeForm.reason,
            };

            if (selectedOvertimeId) {
                await updateOvertime(selectedOvertimeId, payload);
                showSuccess("Ek mesai güncellendi.");
            } else {
                await createOvertime(payload);
                showSuccess("Çalışana ek mesai atandı.");
            }

            closeOvertimeModal();
            await handleLoadOvertimes(false);
        } catch (err) {
            showError(err, "Ek mesai kaydedilemedi.");
        }
    };

    const handleCreateBulkOvertime = async () => {
        try {
            await createBulkOvertime({
                departmentId: Number(bulkOvertimeForm.departmentId),
                overtimeDate: bulkOvertimeForm.overtimeDate,
                startTime: `${bulkOvertimeForm.startTime}:00`,
                endTime: `${bulkOvertimeForm.endTime}:00`,
                reason: bulkOvertimeForm.reason,
            });

            showSuccess("Departmana toplu ek mesai atandı.");
            setBulkOvertimeModalOpen(false);
            await handleLoadOvertimes(false);
        } catch (err) {
            showError(err, "Toplu ek mesai atanamadı.");
        }
    };

    const handleLoadOvertimes = async (showWarning = true) => {
        try {
            if (!overtimeFilter.departmentId) {
                if (showWarning) setError("Ek mesaileri listelemek için departman seçmelisin.");
                return;
            }

            const data = await getDepartmentOvertimes(
                Number(overtimeFilter.departmentId),
                overtimeFilter.startDate,
                overtimeFilter.endDate
            );

            setOvertimes(data);
            setError("");
        } catch (err) {
            showError(err, "Ek mesailer getirilemedi.");
        }
    };

    const handleCancelOvertime = async (id: number) => {
        try {
            await cancelOvertime(id);
            showSuccess("Ek mesai iptal edildi.");
            await handleLoadOvertimes(false);
        } catch (err) {
            showError(err, "Ek mesai iptal edilemedi.");
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-6 overflow-y-auto staffly-scroll">
            <div className="mb-7 rounded-[28px] border border-slate-800 bg-[#050b18] p-6">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
                            HR Schedule Management
                        </p>

                        <h1 className="text-3xl font-bold mt-3 text-slate-100">
                            Çalışma Takvimi Yönetimi
                        </h1>

                        <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                            Departman çalışma saatlerini, haftalık çalışma planlarını ve ek mesai süreçlerini kurumsal olarak yönet.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-center">
                            <p className="text-xl font-bold text-slate-100">{departments.length}</p>
                            <p className="text-xs text-slate-500 mt-1">Departman</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-center">
                            <p className="text-xl font-bold text-emerald-300">
                                {visibleDepartmentWorkSchedules.filter((item) => item.active).length}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Aktif Saat</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-center">
                            <p className="text-xl font-bold text-orange-300">{overtimes.length}</p>
                            <p className="text-xs text-slate-500 mt-1">Ek Mesai</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-5">
                    <button className={tabClass("department-hours")} onClick={() => setActiveTab("department-hours")}>
                        Departmanların Çalışma Saatleri
                    </button>

                    <button className={tabClass("weekly-plan")} onClick={() => setActiveTab("weekly-plan")}>
                        Haftalık Çalışma Planı
                    </button>

                    <button className={tabClass("overtime")} onClick={() => setActiveTab("overtime")}>
                        Ek Mesai Planlama
                    </button>
                </div>
            </div>

            {message && (
                <div className="mb-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {activeTab === "department-hours" && (
                <section className={cardClass}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">Departmanların Çalışma Saatleri</h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Her departman için aktif standart çalışma saatini tanımla.
                            </p>
                        </div>

                        <button className={buttonClass} onClick={openCreateDepartmentHourModal}>
                            + Çalışma Saati Ata
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {visibleDepartmentWorkSchedules.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-slate-800 bg-[#050b18] p-5 hover:border-slate-600 transition flex flex-col justify-between"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                                            Departman
                                        </p>

                                        <h3 className="text-lg font-semibold mt-1">
                                            {getDepartmentName(item.departmentId)}
                                        </h3>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                                                <p className="text-xs text-slate-500">Çalışma</p>
                                                <p className="text-sm font-semibold mt-1">
                                                    {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                                                </p>
                                            </div>

                                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                                                <p className="text-xs text-slate-500">Öğle Arası</p>
                                                <p className="text-sm font-semibold mt-1">
                                                    {item.breakStartTime && item.breakEndTime
                                                        ? `${item.breakStartTime.slice(0, 5)} - ${item.breakEndTime.slice(0, 5)}`
                                                        : "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <span
                                        className={
                                            item.active
                                            ? "rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300"
                                            : "rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs text-red-300"
                                        }
                                    >
                                        {item.active ? "Aktif" : "Pasif"}
                                    </span>
                                </div>

                                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-800">
                                    <button
                                        className="rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-semibold"
                                        onClick={() => openEditDepartmentHourModal(item)}
                                    >
                                        Düzenle
                                    </button>

                                    {item.active ? (
                                        <button
                                            className={dangerButtonClass}
                                            onClick={() => handleDeactivateDepartmentHour(item.id)}
                                        >
                                            Pasife Al
                                        </button>
                                    ) : (
                                        <button
                                            className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 px-4 py-2 text-xs font-semibold text-white"
                                            onClick={() => handleActivateDepartmentHour(item)}
                                        >
                                            Aktif Yap
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {activeTab === "weekly-plan" && (
                <section className={cardClass}>
                    <h2 className="text-xl font-semibold">Departman Haftalık Planı</h2>
                    <p className="text-sm text-slate-400 mt-1 mb-5">
                        Seçilen departmanın hafta içi çalışma modelini gün gün belirle.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-400">
                                Departman
                            </label>
                            <select
                                className={inputClass}
                                value={weeklyPlanForm.departmentId}
                                onChange={(e) =>
                                    setWeeklyPlanForm({
                                        ...weeklyPlanForm,
                                        departmentId: e.target.value,
                                    })
                                }
                            >
                                <option value="">Departman seç</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {workDays.map((day) => (
                            <div
                                key={day.key}
                                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                            >
                                <p className="font-semibold text-sm">{day.label}</p>
                                <input
                                    className={`${inputClass} mt-3`}
                                    type="date"
                                    value={weeklyPlanForm.dayDates[day.key]}
                                    onChange={(e) =>
                                        setWeeklyPlanForm({
                                            ...weeklyPlanForm,
                                            dayDates: {
                                                ...weeklyPlanForm.dayDates,
                                                [day.key]: e.target.value,
                                            },
                                        })
                                    }
                                />

                                <select
                                    className={`${inputClass} mt-4`}
                                    value={weeklyPlanForm.dayModels[day.key]}
                                    onChange={(e) =>
                                        setWeeklyPlanForm({
                                            ...weeklyPlanForm,
                                            dayModels: {
                                                ...weeklyPlanForm.dayModels,
                                                [day.key]: e.target.value as WorkModel,
                                            },
                                        })
                                    }
                                >
                                    {workModels.map((model) => (
                                        <option key={model} value={model}>
                                            {workModelLabels[model]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <button className={`${buttonClass} mt-6`} onClick={handleSaveWeeklyPlan}>
                        Haftalık Planı Kaydet
                    </button>
                </section>
            )}

            {activeTab === "overtime" && (
                <div className="space-y-5">
                    <section className={cardClass}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">Ek Mesai Yönetimi</h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Çalışana veya departmana normal çalışma saatleri dışında ek mesai ata.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button className={buttonClass} onClick={openCreateOvertimeModal}>
                                    + Çalışana Ek Mesai Ata
                                </button>

                                <button className={secondaryButtonClass} onClick={() => setBulkOvertimeModalOpen(true)}>
                                    Departmana Toplu Ata
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className={cardClass}>
                        <h2 className="text-xl font-semibold">Ek Mesai Kayıtları</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5">
                            <select
                                className={inputClass}
                                value={overtimeFilter.departmentId}
                                onChange={(e) =>
                                    setOvertimeFilter({
                                        ...overtimeFilter,
                                        departmentId: e.target.value,
                                    })
                                }
                            >
                                <option value="">Departman seç</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                className={inputClass}
                                type="date"
                                value={overtimeFilter.startDate}
                                onChange={(e) =>
                                    setOvertimeFilter({
                                        ...overtimeFilter,
                                        startDate: e.target.value,
                                    })
                                }
                            />

                            <input
                                className={inputClass}
                                type="date"
                                value={overtimeFilter.endDate}
                                onChange={(e) =>
                                    setOvertimeFilter({
                                        ...overtimeFilter,
                                        endDate: e.target.value,
                                    })
                                }
                            />

                            <button className={buttonClass} onClick={() => handleLoadOvertimes()}>
                                Listele
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {overtimes.map((overtime) => (
                                <div
                                    key={overtime.id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                                >
                                    <div className="flex justify-between gap-3">
                                        <h3 className="font-semibold">{getEmployeeName(overtime.employeeId)}</h3>
                                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                                            {overtime.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-400 mt-3">
                                        Tarih: {overtime.overtimeDate}
                                    </p>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Saat: {overtime.startTime.slice(0, 5)} - {overtime.endTime.slice(0, 5)}
                                    </p>

                                    <p className="text-sm text-slate-500 mt-1">
                                        {overtime.reason || "Açıklama yok"}
                                    </p>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            className="rounded-xl border border-slate-700 hover:border-slate-500 px-4 py-2 text-xs font-semibold text-slate-300"
                                            onClick={() => openEditOvertimeModal(overtime)}
                                        >
                                            Düzenle
                                        </button>

                                        {overtime.status !== "CANCELLED" && (
                                            <button
                                                className={dangerButtonClass}
                                                onClick={() => handleCancelOvertime(overtime.id)}
                                            >
                                                İptal
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {departmentHourModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold">
                            {selectedDepartmentHourId ? "Çalışma Saatini Düzenle" : "Departman Çalışma Saati Ata"}
                        </h2>

                        <p className="text-sm text-slate-400 mt-1 mb-5">
                            Departmanın standart mesai saatini belirle. Düzenleme sırasında departman değiştirilemez.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Departman
                                </label>
                                <select
                                    className={inputClass}
                                    value={departmentHourForm.departmentId}
                                    disabled={selectedDepartmentHourId !== null}
                                    onChange={(e) =>
                                        setDepartmentHourForm({
                                            ...departmentHourForm,
                                            departmentId: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Departman seç</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Çalışma Başlangıç Saati
                                </label>
                                <select
                                    className={inputClass}
                                    value={departmentHourForm.startTime}
                                    onChange={(e) =>
                                        setDepartmentHourForm({
                                            ...departmentHourForm,
                                            startTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Çalışma Bitiş Saati
                                </label>
                                <select
                                    className={inputClass}
                                    value={departmentHourForm.endTime}
                                    onChange={(e) =>
                                        setDepartmentHourForm({
                                            ...departmentHourForm,
                                            endTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Öğle Arası Başlangıç
                                </label>
                                <select
                                    className={inputClass}
                                    value={departmentHourForm.breakStartTime}
                                    onChange={(e) =>
                                        setDepartmentHourForm({
                                            ...departmentHourForm,
                                            breakStartTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Öğle Arası Bitiş
                                </label>
                                <select
                                    className={inputClass}
                                    value={departmentHourForm.breakEndTime}
                                    onChange={(e) =>
                                        setDepartmentHourForm({
                                            ...departmentHourForm,
                                            breakEndTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button className={secondaryButtonClass} onClick={closeDepartmentHourModal}>
                                Vazgeç
                            </button>
                            <button className={buttonClass} onClick={handleCreateOrUpdateDepartmentHour}>
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {overtimeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold">
                            {selectedOvertimeId ? "Ek Mesai Düzenle" : "Çalışana Ek Mesai Ata"}
                        </h2>

                        <p className="text-sm text-slate-400 mt-1 mb-5">
                            Seçilen çalışana belirli bir tarih ve saat aralığı için ek mesai tanımla. Departman çalışandan otomatik alınır.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Çalışan
                                </label>
                                <select
                                    className={inputClass}
                                    value={overtimeForm.employeeId}
                                    onChange={(e) => handleEmployeeSelectForOvertime(e.target.value)}
                                >
                                    <option value="">Çalışan seç</option>
                                    {employees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.firstName} {employee.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Departman
                                </label>
                                <input
                                    className={inputClass}
                                    value={getDepartmentName(Number(overtimeForm.departmentId))}
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Ek Mesai Tarihi
                                </label>
                                <input
                                    className={inputClass}
                                    type="date"
                                    value={overtimeForm.overtimeDate}
                                    onChange={(e) =>
                                        setOvertimeForm({
                                            ...overtimeForm,
                                            overtimeDate: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Başlangıç Saati
                                </label>
                                <select
                                    className={inputClass}
                                    value={overtimeForm.startTime}
                                    onChange={(e) =>
                                        setOvertimeForm({
                                            ...overtimeForm,
                                            startTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Bitiş Saati
                                </label>
                                <select
                                    className={inputClass}
                                    value={overtimeForm.endTime}
                                    onChange={(e) =>
                                        setOvertimeForm({
                                            ...overtimeForm,
                                            endTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Açıklama
                                </label>
                                <input
                                    className={inputClass}
                                    placeholder="Örn: Proje teslimi için ek çalışma"
                                    value={overtimeForm.reason}
                                    onChange={(e) =>
                                        setOvertimeForm({
                                            ...overtimeForm,
                                            reason: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button className={secondaryButtonClass} onClick={closeOvertimeModal}>
                                Vazgeç
                            </button>
                            <button className={buttonClass} onClick={handleCreateOrUpdateOvertime}>
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {bulkOvertimeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold">Departmana Toplu Ek Mesai Ata</h2>

                        <p className="text-sm text-slate-400 mt-1 mb-5">
                            Seçilen departmandaki tüm çalışanlara aynı tarih ve saat aralığında ek mesai tanımla.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Departman
                                </label>
                                <select
                                    className={inputClass}
                                    value={bulkOvertimeForm.departmentId}
                                    onChange={(e) =>
                                        setBulkOvertimeForm({
                                            ...bulkOvertimeForm,
                                            departmentId: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Departman seç</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Ek Mesai Tarihi
                                </label>
                                <input
                                    className={inputClass}
                                    type="date"
                                    value={bulkOvertimeForm.overtimeDate}
                                    onChange={(e) =>
                                        setBulkOvertimeForm({
                                            ...bulkOvertimeForm,
                                            overtimeDate: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Başlangıç Saati
                                </label>
                                <select
                                    className={inputClass}
                                    value={bulkOvertimeForm.startTime}
                                    onChange={(e) =>
                                        setBulkOvertimeForm({
                                            ...bulkOvertimeForm,
                                            startTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Bitiş Saati
                                </label>
                                <select
                                    className={inputClass}
                                    value={bulkOvertimeForm.endTime}
                                    onChange={(e) =>
                                        setBulkOvertimeForm({
                                            ...bulkOvertimeForm,
                                            endTime: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Saat seç</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Açıklama
                                </label>
                                <input
                                    className={inputClass}
                                    placeholder="Örn: Departman kapanış raporu"
                                    value={bulkOvertimeForm.reason}
                                    onChange={(e) =>
                                        setBulkOvertimeForm({
                                            ...bulkOvertimeForm,
                                            reason: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button className={secondaryButtonClass} onClick={() => setBulkOvertimeModalOpen(false)}>
                                Vazgeç
                            </button>
                            <button className={buttonClass} onClick={handleCreateBulkOvertime}>
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkScheduleManagementPage;