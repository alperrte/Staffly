import {
    Building2,
    CalendarDays,
    Pencil,
} from "lucide-react";

import type {
    DepartmentResponse,
    DepartmentWorkScheduleResponse,
    WorkModel,
} from "../../types/workScheduleTypes";

type WorkDayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

type WorkDay = {
    key: WorkDayKey;
    label: string;
    offset: number;
};

type WeeklyPlanForm = {
    departmentId: string;
    dayDates: Record<WorkDayKey, string>;
    dayModels: Record<WorkDayKey, WorkModel>;
};

type Props = {
    departments: DepartmentResponse[];
    schedules: DepartmentWorkScheduleResponse[];
    workDays: readonly WorkDay[];
    workModels: WorkModel[];
    workModelLabels: Record<WorkModel, string>;
    weeklyPlanForm: WeeklyPlanForm;
    setWeeklyPlanForm: React.Dispatch<React.SetStateAction<WeeklyPlanForm>>;
    getDepartmentName: (departmentId?: number | null) => string;
    onSave: () => void;
};

const WeeklyPlanTab = ({
                           departments,
                           schedules,
                           workDays,
                           workModels,
                           workModelLabels,
                           weeklyPlanForm,
                           setWeeklyPlanForm,
                           getDepartmentName,
                           onSave,
                       }: Props) => {
    const activeSchedules = schedules.filter((item) => item.active);

    const selectedDepartment = departments.find(
        (item) => item.id === Number(weeklyPlanForm.departmentId)
    );

    const selectedSchedule = activeSchedules.find(
        (item) => item.departmentId === Number(weeklyPlanForm.departmentId)
    );

    const activeDayCount = workDays.filter(
        (day) => weeklyPlanForm.dayModels[day.key] !== "DAY_OFF"
    ).length;

    const selectDepartment = (departmentId: number) => {
        setWeeklyPlanForm((prev) => ({
            ...prev,
            departmentId: String(departmentId),
        }));
    };

    const updateDayModel = (dayKey: WorkDayKey, model: WorkModel) => {
        setWeeklyPlanForm((prev) => ({
            ...prev,
            dayModels: {
                ...prev.dayModels,
                [dayKey]: model,
            },
        }));
    };

    const updateDayDate = (dayKey: WorkDayKey, date: string) => {
        setWeeklyPlanForm((prev) => ({
            ...prev,
            dayDates: {
                ...prev.dayDates,
                [dayKey]: date,
            },
        }));
    };

    const getDailyWorkTime = (schedule?: DepartmentWorkScheduleResponse) => {
        if (!schedule) return "-";

        return `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}`;
    };

    const getBreakTime = (schedule?: DepartmentWorkScheduleResponse) => {
        if (!schedule || !schedule.breakStartTime || !schedule.breakEndTime) {
            return "-";
        }

        return `${schedule.breakStartTime.slice(0, 5)} - ${schedule.breakEndTime.slice(0, 5)}`;
    };

    return (
        <div className="grid min-h-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
            <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-5 shadow-[0_0_45px_rgba(15,23,42,0.65)]">
                <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-white">
                            Haftalık Çalışma Planı
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Aktif çalışma saati olan departmanı seçip hafta içi çalışma modelini belirleyin.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!weeklyPlanForm.departmentId}
                        className="rounded-xl border border-blue-400/35 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Pencil className="mr-2 inline h-4 w-4" />
                        Planı Kaydet
                    </button>
                </div>

                <div className="mb-5">
                    <label>
                        <span className="mb-2 block text-xs font-bold text-slate-400">
                            Departman
                        </span>

                        <select
                            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-blue-400 [&>option]:bg-slate-950"
                            value={weeklyPlanForm.departmentId}
                            onChange={(e) =>
                                setWeeklyPlanForm((prev) => ({
                                    ...prev,
                                    departmentId: e.target.value,
                                }))
                            }
                        >
                            <option value="">Aktif çalışma saati olan departman seç</option>

                            {activeSchedules.map((schedule) => (
                                <option key={schedule.id} value={schedule.departmentId}>
                                    {getDepartmentName(schedule.departmentId)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {workDays.map((day) => {
                        const isDayOff = weeklyPlanForm.dayModels[day.key] === "DAY_OFF";

                        return (
                            <div
                                key={day.key}
                                className={`rounded-2xl border p-4 ${
                                    isDayOff
                                        ? "border-amber-400/20 bg-amber-500/5"
                                        : "border-emerald-400/20 bg-emerald-500/5"
                                }`}
                            >
                                <div className="mb-4">
                                    <p className="flex items-center gap-2 text-sm font-bold text-white">
                                        <CalendarDays
                                            className={
                                                isDayOff
                                                    ? "h-4 w-4 text-amber-300"
                                                    : "h-4 w-4 text-emerald-300"
                                            }
                                        />
                                        {day.label}
                                    </p>

                                    <input
                                        type="date"
                                        value={weeklyPlanForm.dayDates[day.key]}
                                        onChange={(e) => updateDayDate(day.key, e.target.value)}
                                        className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white outline-none"
                                    />
                                </div>

                                <select
                                    value={weeklyPlanForm.dayModels[day.key]}
                                    onChange={(e) =>
                                        updateDayModel(day.key, e.target.value as WorkModel)
                                    }
                                    className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-bold text-white outline-none [&>option]:bg-slate-950"
                                >
                                    {workModels.map((model) => (
                                        <option key={model} value={model}>
                                            {workModelLabels[model]}
                                        </option>
                                    ))}
                                </select>

                                <p
                                    className={
                                        isDayOff
                                            ? "mt-4 text-sm font-bold text-amber-300"
                                            : "mt-4 text-sm font-bold text-emerald-300"
                                    }
                                >
                                    {isDayOff ? "Pasif" : "Aktif"}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <section className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                    <div className="mb-4">
                        <h3 className="text-lg font-extrabold text-white">
                            Aktif Çalışma Saati Olan Departmanlar
                        </h3>
                        <p className="text-sm text-slate-400">
                            Bir departmana tıklayarak haftalık çalışma planını sağ panelde görüntüleyip düzenleyebilirsiniz.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {activeSchedules.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-slate-900/45 px-4 py-8 text-center text-sm text-slate-500">
                                Aktif çalışma saati olan departman bulunamadı.
                            </div>
                        ) : (
                            activeSchedules.map((item) => {
                                const selected =
                                    Number(weeklyPlanForm.departmentId) === item.departmentId;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => selectDepartment(item.departmentId)}
                                        className={`grid w-full grid-cols-1 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition md:grid-cols-[1fr_160px_160px] ${
                                            selected
                                                ? "border-blue-400/50 bg-blue-500/15"
                                                : "border-white/10 bg-slate-900/45 hover:border-blue-400/30 hover:bg-blue-500/10"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                                                <Building2 className="h-5 w-5" />
                                            </div>

                                            <span className="font-bold text-white">
                                                {getDepartmentName(item.departmentId)}
                                            </span>
                                        </div>

                                        <span className="rounded-lg bg-blue-500/15 px-3 py-1 text-center text-xs font-bold text-blue-300">
                                            {getDailyWorkTime(item)}
                                        </span>

                                        <span className="text-right text-xs font-bold text-slate-300 md:text-sm">
                                            Mola: {getBreakTime(item)}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </section>
            </section>

            <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_0_45px_rgba(15,23,42,0.65)]">
                <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                        <Building2 className="h-6 w-6" />
                    </div>

                    <div>
                        <h3 className="text-xl font-extrabold text-white">
                            {selectedDepartment?.name || "Departman seçiniz"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Atanan haftalık çalışma planı
                        </p>
                    </div>
                </div>

                <div className="space-y-5 border-t border-white/10 pt-5">
                    <SummaryRow
                        label="Günlük Çalışma Saati"
                        value={getDailyWorkTime(selectedSchedule)}
                    />

                    <SummaryRow
                        label="Mola Saati"
                        value={getBreakTime(selectedSchedule)}
                    />

                    <SummaryRow
                        label="Aktif Gün"
                        value={`${activeDayCount} gün`}
                    />

                    <SummaryRow
                        label="İzinli Gün"
                        value={`${5 - activeDayCount} gün`}
                    />
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h4 className="text-sm font-extrabold text-white">
                                Haftalık Plan
                            </h4>
                            <p className="mt-1 text-xs text-slate-500">
                                Sağ panelden gün bazlı çalışma modelini düzenleyebilirsiniz.
                            </p>
                        </div>
                    </div>

                    {!weeklyPlanForm.departmentId ? (
                        <div className="rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-8 text-center text-sm text-slate-500">
                            Planı görüntülemek için alttaki listeden departman seçiniz.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {workDays.map((day) => {
                                const model = weeklyPlanForm.dayModels[day.key];
                                const isDayOff = model === "DAY_OFF";

                                return (
                                    <div
                                        key={day.key}
                                        className={`rounded-2xl border px-4 py-3 ${
                                            isDayOff
                                                ? "border-amber-400/20 bg-amber-500/5"
                                                : "border-emerald-400/20 bg-emerald-500/5"
                                        }`}
                                    >
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {day.label}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {weeklyPlanForm.dayDates[day.key]}
                                                </p>
                                            </div>

                                            <span
                                                className={
                                                    isDayOff
                                                        ? "text-xs font-bold text-amber-300"
                                                        : "text-xs font-bold text-emerald-300"
                                                }
                                            >
                                                {isDayOff ? "Pasif" : "Aktif"}
                                            </span>
                                        </div>

                                        <select
                                            value={model}
                                            onChange={(e) =>
                                                updateDayModel(day.key, e.target.value as WorkModel)
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-bold text-white outline-none [&>option]:bg-slate-950"
                                        >
                                            {workModels.map((workModel) => (
                                                <option key={workModel} value={workModel}>
                                                    {workModelLabels[workModel]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onSave}
                    disabled={!weeklyPlanForm.departmentId}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Planı Kaydet
                </button>
            </aside>
        </div>
    );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);

export default WeeklyPlanTab;