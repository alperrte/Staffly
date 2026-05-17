import { useEffect, useMemo, useState } from "react";

import {
    cancelOvertime,
    createBulkWorkSchedule,
    createDepartmentWorkSchedule,
    createOvertime,
    getDepartmentOvertimes,
    getDepartmentWorkSchedules,
    getDepartments,
    getEmployees,
    getOvertimes,
    updateDepartmentWorkSchedule,
    updateOvertime,
    deleteDepartmentWorkSchedule,
} from "../../services/workScheduleService";

import type {
    DepartmentResponse,
    DepartmentWorkScheduleResponse,
    EmployeeResponse,
    OvertimeResponse,
    WorkModel,
} from "../../types/workScheduleTypes";

import WorkScheduleHeader, {
    type WorkScheduleTab,
} from "../../components/workSchedule/WorkScheduleHeader";
import DepartmentHoursTab from "../../components/workSchedule/DepartmentHoursTab";
import WeeklyPlanTab from "../../components/workSchedule/WeeklyPlanTab";
import OvertimeTab from "../../components/workSchedule/OvertimeTab";
import OvertimeModal from "../../components/workSchedule/OvertimeModal";
import ConfirmModal from "../../components/common/ConfirmModal";

const inputClass =
    "w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed [&>option]:bg-slate-950 [&>option]:text-slate-100";

const buttonClass =
    "rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold px-5 py-3 text-sm transition shadow-lg";

const secondaryButtonClass =
    "rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-5 py-3 text-sm transition";

const timeOptions = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00",
];

const workModelLabels: Record<WorkModel, string> = {
    OFFICE: "Ofis",
    HOME_OFFICE: "Home Office",
    HYBRID: "Hibrit",
    REMOTE: "Remote",
    DAY_OFF: "Tatil",
};

const workModels: WorkModel[] = [
    "OFFICE",
    "HOME_OFFICE",
    "HYBRID",
    "REMOTE",
    "DAY_OFF",
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

    const [activeTab, setActiveTab] = useState<WorkScheduleTab>("department-hours");

    const [departmentHourModalOpen, setDepartmentHourModalOpen] = useState(false);
    const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);

    const [selectedDepartmentHourId, setSelectedDepartmentHourId] = useState<number | null>(null);
    const [selectedOvertimeId, setSelectedOvertimeId] = useState<number | null>(null);
    type ConfirmAction =
        | "save-department-hour"
        | "delete-department-hour"
        | "save-weekly-plan"
        | "save-employee-overtime"
        | null;

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalLoading, setConfirmModalLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const [departmentHourToDelete, setDepartmentHourToDelete] =
        useState<DepartmentWorkScheduleResponse | null>(null);
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

    const [overtimeFilter, setOvertimeFilter] = useState({
        departmentId: "",
    });

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

    const showSuccess = (text: string) => {
        setMessage(text);
        setError("");
    };

    const showError = (err: unknown, fallback: string) => {
        const apiError = err as { response?: { data?: { message?: string } } };
        setMessage("");
        setError(apiError.response?.data?.message || fallback);
    };

    const loadInitialData = async () => {
        try {
            const [employeeData, departmentData, departmentScheduleData] =
                await Promise.all([
                    getEmployees(),
                    getDepartments(),
                    getDepartmentWorkSchedules(),
                ]);

            setEmployees(employeeData);
            setDepartments(departmentData);
            setDepartmentWorkSchedules(departmentScheduleData);
            setOvertimes(await getOvertimes());
        } catch {
            setError("Veriler yüklenirken hata oluştu.");
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (activeTab !== "overtime") return;

        const loadOvertimes = async () => {
            try {
                const data = overtimeFilter.departmentId
                    ? await getDepartmentOvertimes(
                        Number(overtimeFilter.departmentId),
                        "1900-01-01",
                        "2999-12-31"
                    )
                    : await getOvertimes();

                setOvertimes(data);
                setError("");
            } catch (err) {
                showError(err, "Ek mesailer getirilemedi.");
            }
        };

        loadOvertimes();
    }, [activeTab, overtimeFilter.departmentId]);

    const getDepartmentName = (departmentId?: number | null) => {
        if (!departmentId) return "Departman yok";

        return (
            departments.find((item) => item.id === departmentId)?.name ||
            `Departman #${departmentId}`
        );
    };

    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((item) => item.id === employeeId);

        return employee
            ? `${employee.firstName} ${employee.lastName}`
            : `Çalışan #${employeeId}`;
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
            breakStartTime: item.breakStartTime
                ? item.breakStartTime.slice(0, 5)
                : "",
            breakEndTime: item.breakEndTime
                ? item.breakEndTime.slice(0, 5)
                : "",
        });
        setDepartmentHourModalOpen(true);
    };

    const validateDepartmentHourForm = () => {
        if (!departmentHourForm.departmentId) {
            setMessage("");
            setError("Departman seçmelisin.");
            return false;
        }

        if (!departmentHourForm.startTime || !departmentHourForm.endTime) {
            setMessage("");
            setError("Çalışma başlangıç ve bitiş saatini seçmelisin.");
            return false;
        }

        if (departmentHourForm.endTime <= departmentHourForm.startTime) {
            setMessage("");
            setError("Çalışma bitiş saati başlangıç saatinden büyük olmalı.");
            return false;
        }

        const hasBreakStart = Boolean(departmentHourForm.breakStartTime);
        const hasBreakEnd = Boolean(departmentHourForm.breakEndTime);

        if (hasBreakStart !== hasBreakEnd) {
            setMessage("");
            setError("Öğle arası için başlangıç ve bitiş saatini birlikte seçmelisin.");
            return false;
        }

        if (hasBreakStart && hasBreakEnd) {
            if (
                departmentHourForm.breakStartTime <= departmentHourForm.startTime ||
                departmentHourForm.breakStartTime >= departmentHourForm.endTime
            ) {
                setMessage("");
                setError("Öğle arası başlangıcı çalışma saatleri arasında olmalı.");
                return false;
            }

            if (
                departmentHourForm.breakEndTime <= departmentHourForm.breakStartTime ||
                departmentHourForm.breakEndTime >= departmentHourForm.endTime
            ) {
                setMessage("");
                setError(
                    "Öğle arası bitişi, öğle arası başlangıcından büyük ve çalışma bitişinden küçük olmalı."
                );
                return false;
            }
        }

        setError("");
        return true;
    };

    const openSaveDepartmentHourConfirm = () => {
        const isValid = validateDepartmentHourForm();

        if (!isValid) return;

        setConfirmAction("save-department-hour");
        setConfirmModalOpen(true);
    };

    const handleCreateOrUpdateDepartmentHour = async () => {
        try {
            const payload = {
                departmentId: Number(departmentHourForm.departmentId),
                startTime: `${departmentHourForm.startTime}:00`,
                endTime: `${departmentHourForm.endTime}:00`,
                breakStartTime: departmentHourForm.breakStartTime
                    ? `${departmentHourForm.breakStartTime}:00`
                    : undefined,
                breakEndTime: departmentHourForm.breakEndTime
                    ? `${departmentHourForm.breakEndTime}:00`
                    : undefined,
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

    const openDeleteDepartmentHourConfirm = (item: DepartmentWorkScheduleResponse) => {
        setDepartmentHourToDelete(item);
        setConfirmAction("delete-department-hour");
        setConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        if (confirmModalLoading) return;

        setConfirmModalOpen(false);
        setConfirmAction(null);
        setDepartmentHourToDelete(null);
    };

    const handleConfirmAction = async () => {
        if (confirmAction === "save-department-hour") {
            try {
                setConfirmModalLoading(true);

                await handleCreateOrUpdateDepartmentHour();

                setConfirmModalOpen(false);
                setConfirmAction(null);
            } finally {
                setConfirmModalLoading(false);
            }

            return;
        }

        if (confirmAction === "save-weekly-plan") {
            try {
                setConfirmModalLoading(true);

                await handleSaveWeeklyPlan();

                setConfirmModalOpen(false);
                setConfirmAction(null);
            } finally {
                setConfirmModalLoading(false);
            }

            return;
        }

        if (confirmAction === "save-employee-overtime") {
            try {
                setConfirmModalLoading(true);

                await handleCreateOrUpdateOvertime();

                setConfirmModalOpen(false);
                setConfirmAction(null);
            } finally {
                setConfirmModalLoading(false);
            }

            return;
        }

        if (confirmAction === "delete-department-hour") {
            await handleDeleteDepartmentHour();
        }
    };

    const handleDeleteDepartmentHour = async () => {
        if (!departmentHourToDelete) return;

        try {
            setConfirmModalLoading(true);

            await deleteDepartmentWorkSchedule(departmentHourToDelete.id);

            showSuccess("Departman çalışma saati silindi.");
            setDepartmentWorkSchedules(await getDepartmentWorkSchedules());

            setConfirmModalOpen(false);
            setDepartmentHourToDelete(null);
        } catch (err) {
            showError(err, "Departman çalışma saati silinemedi.");
        } finally {
            setConfirmModalLoading(false);
        }
    };

    const openSaveWeeklyPlanConfirm = () => {
        if (!weeklyPlanForm.departmentId) {
            setMessage("");
            setError("Haftalık plan için departman seçmelisin.");
            return;
        }

        setError("");
        setConfirmAction("save-weekly-plan");
        setConfirmModalOpen(true);
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

    const handleDepartmentSelectForOvertime = (departmentId: string) => {
        setOvertimeForm((prev) => ({
            ...prev,
            departmentId,
            employeeId: "",
        }));
    };

    const handleEmployeeSelectForOvertime = (employeeId: string) => {
        setOvertimeForm((prev) => ({
            ...prev,
            employeeId,
        }));
    };

    const openSaveEmployeeOvertimeConfirm = () => {
        if (
            !overtimeForm.departmentId ||
            !overtimeForm.employeeId ||
            !overtimeForm.overtimeDate ||
            !overtimeForm.startTime ||
            !overtimeForm.endTime
        ) {
            setMessage("");
            setError("Ek mesai için departman, çalışan, tarih ve saat bilgilerini tamamlamalısın.");
            return;
        }

        setError("");
        setConfirmAction("save-employee-overtime");
        setConfirmModalOpen(true);
    };

    const handleCreateOrUpdateOvertime = async () => {
        try {
            const payload = {
                employeeId: Number(overtimeForm.employeeId),
                departmentId: overtimeForm.departmentId
                    ? Number(overtimeForm.departmentId)
                    : null,
                overtimeDate: overtimeForm.overtimeDate,
                startTime: `${overtimeForm.startTime}:00`,
                endTime: `${overtimeForm.endTime}:00`,
                reason: overtimeForm.reason,
            };

            if (selectedOvertimeId) {
                const updatedOvertime = await updateOvertime(selectedOvertimeId, payload);
                setOvertimes((prev) =>
                    prev.map((item) =>
                        item.id === updatedOvertime.id ? updatedOvertime : item
                    )
                );
                showSuccess("Ek mesai güncellendi.");
            } else {
                const createdOvertime = await createOvertime(payload);
                setOvertimes((prev) => [createdOvertime, ...prev]);
                showSuccess("Çalışana ek mesai atandı.");
            }

            closeOvertimeModal();
        } catch (err) {
            showError(err, "Ek mesai kaydedilemedi.");
        }
    };

    const handleLoadOvertimes = async (showErrorMessage = true) => {
        try {
            const data = overtimeFilter.departmentId
                ? await getDepartmentOvertimes(
                    Number(overtimeFilter.departmentId),
                    "1900-01-01",
                    "2999-12-31"
                )
                : await getOvertimes();

            setOvertimes(data);
            setError("");
        } catch (err) {
            if (showErrorMessage) {
                showError(err, "Ek mesailer getirilemedi.");
            }
        }
    };

    const handleCancelOvertime = async (id: number) => {
        try {
            await cancelOvertime(id);
            showSuccess("Ek mesai iptal edildi.");
            await handleLoadOvertimes();
        } catch (err) {
            showError(err, "Ek mesai iptal edilemedi.");
        }
    };

    return (
        <div className="min-h-full w-full bg-[#020617] p-0 text-slate-100">
            <div className="flex min-h-screen w-full flex-col bg-slate-950/40 p-5">
                <WorkScheduleHeader
                    activeTab={activeTab}
                    departmentCount={departments.length}
                    activeScheduleCount={
                        visibleDepartmentWorkSchedules.filter((item) => item.active).length
                    }
                    overtimeCount={overtimes.length}
                    onTabChange={setActiveTab}
                />

                {message && (
                    <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="mt-5 min-h-0 flex-1">
                    {activeTab === "department-hours" && (
                        <DepartmentHoursTab
                            departments={departments}
                            schedules={visibleDepartmentWorkSchedules}
                            getDepartmentName={getDepartmentName}
                            onCreate={openCreateDepartmentHourModal}
                            onEdit={openEditDepartmentHourModal}
                            onDelete={openDeleteDepartmentHourConfirm}
                        />
                    )}

                    {activeTab === "weekly-plan" && (
                        <WeeklyPlanTab
                            departments={departments}
                            schedules={visibleDepartmentWorkSchedules}
                            workDays={workDays}
                            workModels={workModels}
                            workModelLabels={workModelLabels}
                            weeklyPlanForm={weeklyPlanForm}
                            setWeeklyPlanForm={setWeeklyPlanForm}
                            getDepartmentName={getDepartmentName}
                            onSave={openSaveWeeklyPlanConfirm}
                        />
                    )}

                    {activeTab === "overtime" && (
                        <OvertimeTab
                            departments={departments}
                            overtimes={overtimes}
                            overtimeFilter={overtimeFilter}
                            setOvertimeFilter={setOvertimeFilter}
                            getEmployeeName={getEmployeeName}
                            onCreateEmployeeOvertime={openCreateOvertimeModal}
                            onEdit={openEditOvertimeModal}
                            onCancel={handleCancelOvertime}
                        />
                    )}
                </div>

                {departmentHourModalOpen && (
                    <DepartmentHourModal
                        selectedDepartmentHourId={selectedDepartmentHourId}
                        departmentHourForm={departmentHourForm}
                        setDepartmentHourForm={setDepartmentHourForm}
                        departments={departments}
                        onClose={closeDepartmentHourModal}
                        onSave={openSaveDepartmentHourConfirm}
                    />
                )}

                {overtimeModalOpen && (
                    <OvertimeModal
                        selectedOvertimeId={selectedOvertimeId}
                        overtimeForm={overtimeForm}
                        setOvertimeForm={setOvertimeForm}
                        departments={departments}
                        employees={employees}
                        handleDepartmentSelectForOvertime={handleDepartmentSelectForOvertime}
                        handleEmployeeSelectForOvertime={handleEmployeeSelectForOvertime}
                        onClose={closeOvertimeModal}
                        onSave={openSaveEmployeeOvertimeConfirm}
                    />
                )}

                <ConfirmModal
                    isOpen={confirmModalOpen}
                    variant={
                        confirmAction === "delete-department-hour"
                            ? "danger"
                            : confirmAction === "save-weekly-plan"
                                ? "success"
                                : confirmAction === "save-employee-overtime"
                                    ? "success"
                                : "info"
                    }
                    title={
                        confirmAction === "delete-department-hour"
                            ? "Çalışma Saatini Sil"
                            : confirmAction === "save-weekly-plan"
                                ? "Haftalık Planı Kaydet"
                                : confirmAction === "save-employee-overtime"
                                    ? selectedOvertimeId
                                        ? "Ek Mesaiyi Güncelle"
                                        : "Çalışana Ek Mesai Ata"
                                : selectedDepartmentHourId
                                    ? "Çalışma Saatini Güncelle"
                                    : "Çalışma Saati Oluştur"
                    }
                    description={
                        confirmAction === "delete-department-hour"
                            ? "Bu departmana ait çalışma saati kaydı silinecek."
                            : confirmAction === "save-weekly-plan"
                                ? "Seçili departman için haftalık çalışma planı kaydedilecek."
                                : confirmAction === "save-employee-overtime"
                                    ? selectedOvertimeId
                                        ? "Seçili çalışanın ek mesai kaydı güncellenecek."
                                        : "Seçili çalışana ek mesai kaydı atanacak."
                                : selectedDepartmentHourId
                                    ? "Bu departmana ait çalışma saati bilgileri güncellenecek."
                                    : "Seçilen departman için yeni çalışma saati oluşturulacak."
                    }
                    detailText={
                        confirmAction === "delete-department-hour"
                            ? "Bu işlem tamamlandıktan sonra kayıt listede görünmeyecek."
                            : confirmAction === "save-weekly-plan"
                                ? "Hafta içi seçilen çalışma modelleri bu departman için sisteme aktarılacak."
                                : confirmAction === "save-employee-overtime"
                                    ? "Kayıt tamamlandıktan sonra ilgili ek mesai listede hemen görünecek."
                                : selectedDepartmentHourId
                                    ? "Güncelleme sonrasında departmanın çalışma saati yeni bilgilerle listelenecek."
                                    : "Oluşturma sonrasında bu departman için aktif çalışma saati listede görünecek."
                    }
                    itemName={
                        confirmAction === "delete-department-hour" && departmentHourToDelete
                            ? `${getDepartmentName(departmentHourToDelete.departmentId)} - ${departmentHourToDelete.startTime.slice(0, 5)} / ${departmentHourToDelete.endTime.slice(0, 5)}`
                            : confirmAction === "save-weekly-plan"
                                ? getDepartmentName(Number(weeklyPlanForm.departmentId))
                                : confirmAction === "save-employee-overtime"
                                    ? `${getEmployeeName(Number(overtimeForm.employeeId))} - ${overtimeForm.overtimeDate} ${overtimeForm.startTime} / ${overtimeForm.endTime}`
                                : departmentHourForm.departmentId
                                    ? `${getDepartmentName(Number(departmentHourForm.departmentId))} - ${departmentHourForm.startTime} / ${departmentHourForm.endTime}`
                                    : undefined
                    }
                    confirmText={
                        confirmAction === "delete-department-hour"
                            ? "Evet, Sil"
                            : confirmAction === "save-weekly-plan"
                                ? "Evet, Planı Kaydet"
                                : confirmAction === "save-employee-overtime"
                                    ? selectedOvertimeId
                                        ? "Evet, Güncelle"
                                        : "Evet, Ata"
                                : selectedDepartmentHourId
                                    ? "Evet, Güncelle"
                                    : "Evet, Oluştur"
                    }
                    cancelText="Vazgeç"
                    isLoading={confirmModalLoading}
                    onClose={closeConfirmModal}
                    onConfirm={handleConfirmAction}
                />
            </div>
        </div>
    );
};

const DepartmentHourModal = ({
                                 selectedDepartmentHourId,
                                 departmentHourForm,
                                 setDepartmentHourForm,
                                 departments,
                                 onClose,
                                 onSave,
                             }: {
    selectedDepartmentHourId: number | null;
    departmentHourForm: {
        departmentId: string;
        startTime: string;
        endTime: string;
        breakStartTime: string;
        breakEndTime: string;
    };
    setDepartmentHourForm: React.Dispatch<
        React.SetStateAction<{
            departmentId: string;
            startTime: string;
            endTime: string;
            breakStartTime: string;
            breakEndTime: string;
        }>
    >;
    departments: DepartmentResponse[];
    onClose: () => void;
    onSave: () => void;
}) => {
    const endTimeOptions = timeOptions.filter(
        (time) => !departmentHourForm.startTime || time > departmentHourForm.startTime
    );

    const breakStartOptions = timeOptions.filter(
        (time) =>
            departmentHourForm.startTime &&
            departmentHourForm.endTime &&
            time > departmentHourForm.startTime &&
            time < departmentHourForm.endTime
    );

    const breakEndOptions = timeOptions.filter(
        (time) =>
            departmentHourForm.startTime &&
            departmentHourForm.endTime &&
            departmentHourForm.breakStartTime &&
            time > departmentHourForm.breakStartTime &&
            time < departmentHourForm.endTime
    );

    const handleStartTimeChange = (value: string) => {
        setDepartmentHourForm((prev) => {
            const next = {
                ...prev,
                startTime: value,
            };

            if (next.endTime && next.endTime <= value) {
                next.endTime = "";
                next.breakStartTime = "";
                next.breakEndTime = "";
            }

            if (
                next.breakStartTime &&
                (next.breakStartTime <= value || !next.endTime || next.breakStartTime >= next.endTime)
            ) {
                next.breakStartTime = "";
                next.breakEndTime = "";
            }

            if (
                next.breakEndTime &&
                (next.breakEndTime <= value || !next.endTime || next.breakEndTime >= next.endTime)
            ) {
                next.breakEndTime = "";
            }

            return next;
        });
    };

    const handleEndTimeChange = (value: string) => {
        setDepartmentHourForm((prev) => {
            const next = {
                ...prev,
                endTime: value,
            };

            if (
                next.breakStartTime &&
                (next.breakStartTime <= next.startTime || next.breakStartTime >= value)
            ) {
                next.breakStartTime = "";
                next.breakEndTime = "";
            }

            if (
                next.breakEndTime &&
                (next.breakEndTime <= next.startTime || next.breakEndTime >= value)
            ) {
                next.breakEndTime = "";
            }

            return next;
        });
    };

    const handleBreakStartChange = (value: string) => {
        setDepartmentHourForm((prev) => {
            const next = {
                ...prev,
                breakStartTime: value,
            };

            if (next.breakEndTime && next.breakEndTime <= value) {
                next.breakEndTime = "";
            }

            return next;
        });
    };

    const handleBreakEndChange = (value: string) => {
        setDepartmentHourForm((prev) => ({
            ...prev,
            breakEndTime: value,
        }));
    };

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-white">
                    {selectedDepartmentHourId
                        ? "Çalışma Saatini Düzenle"
                        : "Departman Çalışma Saati Ata"}
                </h2>

                <p className="mt-1 mb-5 text-sm text-slate-400">
                    Departmanın standart mesai saatini belirle. Düzenleme sırasında departman değiştirilemez.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-slate-400">
                            Departman
                        </label>

                        <select
                            className={inputClass}
                            value={departmentHourForm.departmentId}
                            disabled={selectedDepartmentHourId !== null}
                            onChange={(e) =>
                                setDepartmentHourForm((prev) => ({
                                    ...prev,
                                    departmentId: e.target.value,
                                }))
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

                    <TimeSelect
                        label="Çalışma Başlangıç Saati"
                        value={departmentHourForm.startTime}
                        options={timeOptions}
                        onChange={handleStartTimeChange}
                    />

                    <TimeSelect
                        label="Çalışma Bitiş Saati"
                        value={departmentHourForm.endTime}
                        options={endTimeOptions}
                        disabled={!departmentHourForm.startTime}
                        placeholder={
                            departmentHourForm.startTime
                                ? "Saat seç"
                                : "Önce başlangıç seç"
                        }
                        onChange={handleEndTimeChange}
                    />

                    <TimeSelect
                        label="Öğle Arası Başlangıç"
                        value={departmentHourForm.breakStartTime}
                        options={breakStartOptions}
                        disabled={!departmentHourForm.startTime || !departmentHourForm.endTime}
                        placeholder={
                            departmentHourForm.startTime && departmentHourForm.endTime
                                ? "Saat seç"
                                : "Önce çalışma saatlerini seç"
                        }
                        onChange={handleBreakStartChange}
                    />

                    <TimeSelect
                        label="Öğle Arası Bitiş"
                        value={departmentHourForm.breakEndTime}
                        options={breakEndOptions}
                        disabled={
                            !departmentHourForm.startTime ||
                            !departmentHourForm.endTime ||
                            !departmentHourForm.breakStartTime
                        }
                        placeholder={
                            departmentHourForm.breakStartTime
                                ? "Saat seç"
                                : "Önce mola başlangıcı seç"
                        }
                        onChange={handleBreakEndChange}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button className={secondaryButtonClass} onClick={onClose}>
                        Vazgeç
                    </button>

                    <button className={buttonClass} onClick={onSave}>
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
};

const TimeSelect = ({
                        label,
                        value,
                        options,
                        onChange,
                        disabled = false,
                        placeholder = "Saat seç",
                    }: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}) => (
    <div>
        <label className="mb-2 block text-xs font-bold text-slate-400">
            {label}
        </label>

        <select
            className={inputClass}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{placeholder}</option>

            {options.map((time) => (
                <option key={time} value={time}>
                    {time}
                </option>
            ))}
        </select>
    </div>
);

export default WorkScheduleManagementPage;
