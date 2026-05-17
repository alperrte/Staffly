import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    Briefcase,
    CalendarDays,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Coffee,
    Filter,
    Home,
    MapPin,
    MoreHorizontal,
    Plane,
    Play,
    Square,
    Users,
    Zap,
} from "lucide-react";

import {
    getCalendarEvents,
    getCompanyHolidays,
    getEmployeeOvertimes,
    getEmployeeSchedule,
} from "../../services/workScheduleService";
import { getMyProfile } from "../../services/employeeService";
import { getTokenUserId } from "../../utils/auth";

import type {
    CalendarEventResponse,
    CompanyHolidayResponse,
    OvertimeResponse,
    WorkModel,
    WorkScheduleResponse,
} from "../../types/workScheduleTypes";

const dayNames = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
];

const shortDayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const workModelLabel: Record<WorkModel, string> = {
    OFFICE: "Ofis",
    HOME_OFFICE: "Home Office",
    HYBRID: "Hibrit",
    REMOTE: "Remote",
    DAY_OFF: "İzin Günü",
};

const workModelDotClass: Record<WorkModel, string> = {
    OFFICE: "bg-emerald-400",
    HOME_OFFICE: "bg-sky-400",
    HYBRID: "bg-purple-400",
    REMOTE: "bg-cyan-400",
    DAY_OFF: "bg-orange-400",
};

const eventTypeLabel: Record<CalendarEventResponse["eventType"], string> = {
    MEETING: "Toplantı",
    TRAINING: "Eğitim",
    INTERVIEW: "Görüşme",
    COMPANY_EVENT: "Şirket Etkinliği",
    OTHER: "Etkinlik",
};

const eventCardClass: Record<CalendarEventResponse["eventType"], string> = {
    MEETING: "border-purple-500/40 bg-purple-500/15 text-purple-100",
    TRAINING: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
    INTERVIEW: "border-sky-500/40 bg-sky-500/15 text-sky-100",
    COMPANY_EVENT: "border-orange-500/40 bg-orange-500/15 text-orange-100",
    OTHER: "border-cyan-500/40 bg-cyan-500/15 text-cyan-100",
};

const getMonday = (date: Date) => {
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    current.setDate(diff);
    return current;
};

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
    });
};

const formatWeekRange = (start: Date, end: Date) => {
    return `${formatDisplayDate(start)} - ${formatDisplayDate(end)} ${end.getFullYear()}`;
};

const formatTime = (value?: string | null) => {
    if (!value) return "--:--";
    return value.slice(0, 5);
};

const formatDateTimeHour = (value?: string | null) => {
    if (!value) return "--:--";
    return value.slice(11, 16);
};

const calculateDurationText = (start?: string | null, end?: string | null) => {
    if (!start || !end) return "0s";

    const [startHour, startMinute] = start.slice(0, 5).split(":").map(Number);
    const [endHour, endMinute] = end.slice(0, 5).split(":").map(Number);

    const diff = endHour * 60 + endMinute - (startHour * 60 + startMinute);

    if (diff <= 0) return "0s";

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours > 0 && minutes > 0) return `${hours}s ${minutes}dk`;
    if (hours > 0) return `${hours}s`;
    return `${minutes}dk`;
};

const getEventTopOffset = (startDateTime: string) => {
    const hour = Number(startDateTime.slice(11, 13));
    const minute = Number(startDateTime.slice(14, 16));
    const startHour = 8;

    return Math.max(0, (hour - startHour) * 62 + minute);
};

const getEventHeight = (startDateTime: string, endDateTime: string) => {
    const startHour = Number(startDateTime.slice(11, 13));
    const startMinute = Number(startDateTime.slice(14, 16));
    const endHour = Number(endDateTime.slice(11, 13));
    const endMinute = Number(endDateTime.slice(14, 16));

    const diff = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    return Math.max(74, diff);
};

const MySchedulePage = () => {
    const myUserId = getTokenUserId();

    const [employeeId, setEmployeeId] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [departmentId, setDepartmentId] = useState<number | null>(null);

    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        getMonday(new Date())
    );

    const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([]);
    const [events, setEvents] = useState<CalendarEventResponse[]>([]);
    const [overtimes, setOvertimes] = useState<OvertimeResponse[]>([]);
    const [holidays, setHolidays] = useState<CompanyHolidayResponse[]>([]);
    const [error, setError] = useState("");

    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) =>
            addDays(currentWeekStart, index)
        );
    }, [currentWeekStart]);

    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);

    useEffect(() => {
        const loadCurrentEmployee = async () => {
            try {
                setError("");

                const profile = await getMyProfile().catch(() => null);
                const resolvedEmployeeId = profile?.id ?? profile?.employeeId ?? myUserId;

                if (!resolvedEmployeeId) {
                    setError("Çalışan bilgisi bulunamadı.");
                    return;
                }

                setEmployeeId(String(resolvedEmployeeId));
                setDepartmentId(profile?.departmentId ?? null);
                setEmployeeName(
                    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ")
                );
            } catch (err) {
                console.error(err);
                setError("Çalışan bilgisi alınamadı.");
            }
        };

        loadCurrentEmployee();
    }, [myUserId]);

    useEffect(() => {
        if (!employeeId) return;

        const loadCalendar = async () => {
            try {
                setError("");

                const [scheduleData, eventData, overtimeData, holidayData] =
                    await Promise.all([
                        getEmployeeSchedule(Number(employeeId), startDate, endDate),
                        getCalendarEvents(`${startDate}T00:00:00`, `${endDate}T23:59:59`),
                        getEmployeeOvertimes(Number(employeeId), startDate, endDate),
                        getCompanyHolidays(),
                    ]);

                setSchedules(scheduleData || []);
                setOvertimes(overtimeData || []);
                setHolidays(holidayData || []);

                const visibleEvents = (eventData || []).filter((event) => {
                    const isParticipant = event.participants?.some(
                        (participant) => participant.employeeId === Number(employeeId)
                    );
                    const isDepartmentEvent =
                        departmentId != null && event.departmentId === departmentId;
                    const isGlobalEvent = event.departmentId == null;

                    return (
                        event.status === "ACTIVE" &&
                        (isParticipant || isDepartmentEvent || isGlobalEvent)
                    );
                });

                setEvents(visibleEvents);
            } catch (err) {
                console.error(err);
                setSchedules([]);
                setEvents([]);
                setOvertimes([]);
                setHolidays([]);
                setError("Takvim verileri alınamadı.");
            }
        };

        loadCalendar();
    }, [employeeId, departmentId, startDate, endDate]);

    const getScheduleByDate = (date: string) =>
        schedules.find((schedule) => schedule.workDate === date);

    const getEventsByDate = (date: string) =>
        events.filter((event) => event.startDateTime?.startsWith(date));

    const getOvertimesByDate = (date: string) =>
        overtimes.filter((overtime) => overtime.overtimeDate === date);

    const getHolidayByDate = (date: string) =>
        holidays.find((holiday) => holiday.holidayDate === date && holiday.active);

    const totalWeeklyMinutes = useMemo(() => {
        return schedules.reduce((total, schedule) => {
            if (!schedule.shift?.startTime || !schedule.shift?.endTime) return total;

            const [startHour, startMinute] = schedule.shift.startTime
                .slice(0, 5)
                .split(":")
                .map(Number);
            const [endHour, endMinute] = schedule.shift.endTime
                .slice(0, 5)
                .split(":")
                .map(Number);

            return total + (endHour * 60 + endMinute - (startHour * 60 + startMinute));
        }, 0);
    }, [schedules]);

    const weeklyHoursText = useMemo(() => {
        const hours = Math.floor(totalWeeklyMinutes / 60);
        const minutes = totalWeeklyMinutes % 60;

        return `${hours}s ${minutes}dk`;
    }, [totalWeeklyMinutes]);

    const homeOfficeCount = schedules.filter(
        (schedule) => schedule.workModel === "HOME_OFFICE"
    ).length;

    const dayOffCount = schedules.filter(
        (schedule) => schedule.workModel === "DAY_OFF"
    ).length;

    const totalOvertimeMinutes = overtimes.reduce((total, overtime) => {
        if (!overtime.startTime || !overtime.endTime) return total;

        const [startHour, startMinute] = overtime.startTime.slice(0, 5).split(":").map(Number);
        const [endHour, endMinute] = overtime.endTime.slice(0, 5).split(":").map(Number);

        return total + (endHour * 60 + endMinute - (startHour * 60 + startMinute));
    }, 0);

    const overtimeText = `${Math.floor(totalOvertimeMinutes / 60)}s ${
        totalOvertimeMinutes % 60
    }dk`;

    const todayText = formatDate(new Date());
    const todaySchedule = getScheduleByDate(todayText);
    const todayEvents = getEventsByDate(todayText);

    const goPreviousWeek = () => {
        setCurrentWeekStart((prev) => addDays(prev, -7));
    };

    const goNextWeek = () => {
        setCurrentWeekStart((prev) => addDays(prev, 7));
    };

    const goCurrentWeek = () => {
        setCurrentWeekStart(getMonday(new Date()));
    };

    return (
        <div className="min-h-full w-full bg-[#020617] p-0 text-slate-100">
            <div className="flex min-h-screen w-full flex-col bg-slate-950/40 p-5">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_330px]">
                    <main className="min-w-0 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-white">
                                    Haftalık Takvimim
                                </h1>

                                <p className="mt-2 text-sm text-slate-400">
                                    Çalışma planı, ek mesai, toplantı ve şirket tatillerini görüntüle.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <select
                                    className="h-12 rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 text-sm font-semibold text-slate-100 outline-none"
                                    value={employeeName || "Çalışan"}
                                    disabled
                                >
                                    <option>{employeeName || "Çalışan"}</option>
                                </select>

                                <button className="h-12 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 text-sm font-semibold text-white shadow-lg transition hover:from-sky-400 hover:to-indigo-400">
                                    Takvimi Getir
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                            <SummaryCard
                                icon={<Clock3 className="h-6 w-6" />}
                                iconClass="bg-sky-500/15 text-sky-300"
                                title="Haftalık Çalışma Süresi"
                                value={weeklyHoursText}
                                description="Hedef: 45s"
                                progress={Math.min((totalWeeklyMinutes / 2700) * 100, 100)}
                                progressClass="bg-emerald-400"
                            />

                            <SummaryCard
                                icon={<Home className="h-6 w-6" />}
                                iconClass="bg-emerald-500/15 text-emerald-300"
                                title="Home Office Günleri"
                                value={`${homeOfficeCount} Gün`}
                                description="%40"
                                progress={Math.min((homeOfficeCount / 5) * 100, 100)}
                                progressClass="bg-sky-400"
                            />

                            <SummaryCard
                                icon={<Users className="h-6 w-6" />}
                                iconClass="bg-purple-500/15 text-purple-300"
                                title="Toplantı Sayısı"
                                value={`${events.length} Toplantı`}
                                description="Bu hafta"
                                progress={Math.min((events.length / 10) * 100, 100)}
                                progressClass="bg-purple-400"
                            />

                            <SummaryCard
                                icon={<CalendarDays className="h-6 w-6" />}
                                iconClass="bg-orange-500/15 text-orange-300"
                                title="İzin Günü"
                                value={`${dayOffCount} Gün`}
                                description="Kullanılan"
                                progress={Math.min((dayOffCount / 5) * 100, 100)}
                                progressClass="bg-orange-400"
                            />

                            <SummaryCard
                                icon={<Zap className="h-6 w-6" />}
                                iconClass="bg-violet-500/15 text-violet-300"
                                title="Fazla Mesai"
                                value={overtimeText}
                                description="Bu hafta"
                                progress={Math.min((totalOvertimeMinutes / 600) * 100, 100)}
                                progressClass="bg-violet-400"
                            />
                        </div>

                        <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex rounded-xl border border-slate-700/80 bg-slate-900/80 p-1">
                                <button className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-400">
                                    Gün
                                </button>
                                <button className="rounded-lg bg-sky-500/20 px-5 py-2 text-sm font-semibold text-sky-300 shadow">
                                    Hafta
                                </button>
                                <button className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-400">
                                    Ay
                                </button>
                            </div>

                            <button
                                onClick={goCurrentWeek}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900 px-5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                <CalendarDays className="h-4 w-4" />
                                Bugün
                            </button>

                            <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900 px-4 py-2">
                                <button
                                    onClick={goPreviousWeek}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    {formatWeekRange(weekDates[0], weekDates[6])}
                                </div>

                                <button
                                    onClick={goNextWeek}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900 px-5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
                                    <Filter className="h-4 w-4" />
                                    Filtrele
                                </button>

                                <button className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 transition hover:bg-slate-800">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <section className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70">
                            <div className="grid grid-cols-[54px_repeat(7,minmax(150px,1fr))] border-b border-slate-800/80">
                                <div className="bg-slate-950/80" />

                                {weekDates.map((date, index) => {
                                    const dateText = formatDate(date);
                                    const schedule = getScheduleByDate(dateText);
                                    const holiday = getHolidayByDate(dateText);

                                    return (
                                        <div
                                            key={dateText}
                                            className="border-l border-slate-800/80 bg-slate-900/40 px-3 py-4 text-center"
                                        >
                                            <p className="text-sm font-black text-white">
                                                {dayNames[index]}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {date.toLocaleDateString("tr-TR", {
                                                    day: "numeric",
                                                    month: "long",
                                                })}
                                            </p>

                                            {holiday ? (
                                                <p className="mt-2 text-sm font-semibold text-orange-300">
                                                    İzin Günü
                                                </p>
                                            ) : schedule ? (
                                                <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-300">
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${
                                                            workModelDotClass[schedule.workModel]
                                                        }`}
                                                    />
                                                    {workModelLabel[schedule.workModel]}
                                                </p>
                                            ) : (
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Çalışma Yok
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-[54px_repeat(7,minmax(150px,1fr))]">
                                <div className="bg-slate-950/80">
                                    {Array.from({ length: 12 }, (_, index) => {
                                        const hour = index + 8;

                                        return (
                                            <div
                                                key={hour}
                                                className="flex h-[62px] items-start justify-end border-b border-slate-800/50 pr-2 pt-2 text-xs text-slate-500"
                                            >
                                                {String(hour).padStart(2, "0")}:00
                                            </div>
                                        );
                                    })}
                                </div>

                                {weekDates.map((date, index) => {
                                    const dateText = formatDate(date);
                                    const schedule = getScheduleByDate(dateText);
                                    const dayEvents = getEventsByDate(dateText);
                                    const dayOvertimes = getOvertimesByDate(dateText);
                                    const holiday = getHolidayByDate(dateText);

                                    return (
                                        <div
                                            key={dateText}
                                            className="relative min-h-[744px] border-l border-slate-800/80 bg-slate-950/50"
                                        >
                                            {Array.from({ length: 12 }, (_, hourIndex) => (
                                                <div
                                                    key={hourIndex}
                                                    className="h-[62px] border-b border-slate-800/50"
                                                />
                                            ))}

                                            {holiday ? (
                                                <FullDayCard
                                                    variant={index === 5 ? "orange" : "slate"}
                                                    icon={index === 5 ? "🏝️" : "☂️"}
                                                    title={holiday.name || "İzin"}
                                                    subtitle={holiday.description || "Tüm gün izin"}
                                                />
                                            ) : schedule ? (
                                                <>
                                                    <WorkBlock schedule={schedule} />

                                                    {schedule.shift?.breakStartTime &&
                                                        schedule.shift?.breakEndTime && (
                                                            <BreakBlock schedule={schedule} />
                                                        )}

                                                    {schedule.shift?.endTime && (
                                                        <ExitBadge
                                                            time={formatTime(schedule.shift.endTime)}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <FullDayCard
                                                    variant="slate"
                                                    icon="☂️"
                                                    title="Dinlenme Günü"
                                                    subtitle="Çalışma planı yok"
                                                />
                                            )}

                                            {dayEvents.map((event) => (
                                                <EventBlock key={event.id} event={event} />
                                            ))}

                                            {dayOvertimes.map((overtime) => (
                                                <OvertimeBlock
                                                    key={overtime.id}
                                                    overtime={overtime}
                                                />
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-slate-400">
                            <span className="font-semibold text-red-300">
                                Resmi Tatil:
                            </span>{" "}
                            Bu hafta içinde aktif şirket tatili varsa takvim üzerinde gösterilir.
                        </div>

                        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                                <Legend color="bg-emerald-400" label="Ofis" />
                                <Legend color="bg-sky-400" label="Home Office" />
                                <Legend color="bg-purple-400" label="Toplantı" />
                                <Legend color="bg-orange-400" label="İzin" />
                                <Legend color="bg-red-400" label="Resmi Tatil" />
                                <Legend color="bg-slate-500" label="Çalışma Yok" />
                            </div>

                            <div className="flex justify-end gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
                                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-white shadow-[0_18px_45px_rgba(16,185,129,0.22)] transition hover:bg-emerald-400">
                                    <Play className="h-4 w-4 fill-white" />
                                    Mesaiye Başla
                                </button>

                                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-500 px-6 text-sm font-bold text-white shadow-[0_18px_45px_rgba(239,68,68,0.22)] transition hover:bg-red-400">
                                    <Square className="h-4 w-4 fill-white" />
                                    Mesaiyi Bitir
                                </button>
                            </div>
                        </div>
                    </main>

                    <aside className="space-y-4">
                        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">
                                    Bugünkü Özet
                                </h2>

                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                    {todaySchedule
                                        ? workModelLabel[todaySchedule.workModel]
                                        : "Boş"}
                                </span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <InfoRow
                                    icon={<CalendarDays className="h-4 w-4" />}
                                    label="Çalışma Saati"
                                    value={
                                        todaySchedule?.shift
                                            ? `${formatTime(todaySchedule.shift.startTime)} - ${formatTime(todaySchedule.shift.endTime)}`
                                            : "--:-- - --:--"
                                    }
                                />

                                <InfoRow
                                    icon={<Briefcase className="h-4 w-4" />}
                                    label="Giriş Saati"
                                    value="08:57"
                                    badge="Zamanında"
                                />

                                <InfoRow
                                    icon={<Briefcase className="h-4 w-4" />}
                                    label="Çıkış Saati"
                                    value="--:--"
                                />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">
                                    Toplantılar
                                </h2>

                                <span className="rounded-lg bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-300">
                                    {todayEvents.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {todayEvents.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Bugün toplantı bulunmuyor.
                                    </p>
                                ) : (
                                    todayEvents.slice(0, 3).map((event) => (
                                        <SmallEventCard key={event.id} event={event} />
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">
                                    Görevler
                                </h2>

                                <span className="rounded-lg bg-sky-500/20 px-2 py-1 text-xs font-bold text-sky-300">
                                    3
                                </span>
                            </div>

                            <div className="space-y-3">
                                <TaskRow checked label="Aylık Bordro Kontrolleri" />
                                <TaskRow label="Müşteri Raporu" />
                                <TaskRow label="Çalışan Prim Hesaplama" />
                            </div>

                            <button className="mt-4 h-11 w-full rounded-xl border border-slate-700/80 bg-slate-900 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white">
                                Tüm Görevlerimi Gör
                            </button>
                        </section>

                        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <h2 className="mb-4 text-lg font-black text-white">
                                Hızlı İşlemler
                            </h2>

                            <div className="grid grid-cols-4 gap-3">
                                <QuickAction icon={<CalendarDays className="h-5 w-5" />} label="İzin Talebi" />
                                <QuickAction icon={<Users className="h-5 w-5" />} label="Toplantı Planla" />
                                <QuickAction icon={<CheckSquare className="h-5 w-5" />} label="Görev Ekle" />
                                <QuickAction icon={<BarChart3 className="h-5 w-5" />} label="Raporlarım" />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <h2 className="mb-4 text-lg font-black text-white">
                                Yaklaşan Etkinlikler
                            </h2>

                            <div className="space-y-4">
                                {events.slice(0, 3).map((event) => (
                                    <SmallEventCard key={event.id} event={event} />
                                ))}

                                {events.length === 0 && (
                                    <p className="text-sm text-slate-500">
                                        Yaklaşan etkinlik bulunmuyor.
                                    </p>
                                )}
                            </div>

                            <button className="mt-5 flex w-full items-center justify-between text-sm font-semibold text-sky-400 transition hover:text-sky-300">
                                Takvimin Tamamını Görüntüle
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({
                         icon,
                         iconClass,
                         title,
                         value,
                         description,
                         progress,
                         progressClass,
                     }: {
    icon: JSX.Element;
    iconClass: string;
    title: string;
    value: string;
    description: string;
    progress: number;
    progressClass: string;
}) => (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
        <div className="flex items-center gap-4">
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
            >
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-sm text-slate-400">{title}</p>
                <p className="mt-1 text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{description}</p>
            </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
                className={`h-full rounded-full ${progressClass}`}
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);

const WorkBlock = ({ schedule }: { schedule: WorkScheduleResponse }) => {
    const start = formatTime(schedule.shift?.startTime || "09:00");
    const end = formatTime(schedule.shift?.endTime || "18:00");

    return (
        <div
            className="absolute left-2 right-2 top-[10px] rounded-xl border border-emerald-500/35 bg-emerald-500/15 p-3 text-xs text-emerald-100 shadow-lg"
            style={{ height: 74 }}
        >
            <p className="font-bold">
                {start} - {end}
            </p>
            <p className="mt-1 text-emerald-100/80">Çalışma Saati</p>
        </div>
    );
};

const BreakBlock = ({ schedule }: { schedule: WorkScheduleResponse }) => (
    <div
        className="absolute left-2 right-2 rounded-xl border border-emerald-500/35 bg-emerald-500/15 p-3 text-xs text-emerald-100"
        style={{ top: 260, height: 58 }}
    >
        <p className="font-bold">Lunch Break</p>
        <p className="mt-1">
            {formatTime(schedule.shift?.breakStartTime)} -{" "}
            {formatTime(schedule.shift?.breakEndTime)}
        </p>
    </div>
);

const EventBlock = ({ event }: { event: CalendarEventResponse }) => {
    return (
        <div
            className={`absolute left-2 right-2 rounded-xl border p-3 text-xs shadow-lg ${
                eventCardClass[event.eventType]
            }`}
            style={{
                top: getEventTopOffset(event.startDateTime),
                height: getEventHeight(event.startDateTime, event.endDateTime),
            }}
        >
            <p className="font-black">{event.title}</p>

            <p className="mt-1 opacity-90">
                {formatDateTimeHour(event.startDateTime)} -{" "}
                {formatDateTimeHour(event.endDateTime)}
            </p>

            {event.participants && (
                <p className="mt-1 opacity-75">
                    {event.participants.length} katılımcı
                </p>
            )}

            {event.location && (
                <p className="mt-1 flex items-center gap-1 opacity-75">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                </p>
            )}
        </div>
    );
};

const OvertimeBlock = ({ overtime }: { overtime: OvertimeResponse }) => (
    <div
        className="absolute left-2 right-2 rounded-xl border border-violet-500/40 bg-violet-500/15 p-3 text-xs text-violet-100 shadow-lg"
        style={{ top: 520, height: 70 }}
    >
        <p className="font-black">Ek Mesai</p>
        <p className="mt-1">
            {formatTime(overtime.startTime)} - {formatTime(overtime.endTime)}
        </p>
        {overtime.reason && <p className="mt-1 opacity-75">{overtime.reason}</p>}
    </div>
);

const ExitBadge = ({ time }: { time: string }) => (
    <div className="absolute bottom-8 left-2 right-2 rounded-lg border border-emerald-500/20 bg-slate-900/80 px-2 py-1 text-xs text-slate-200">
        <span className="text-emerald-400">⚑</span> {time} Çıkış
    </div>
);

const FullDayCard = ({
                         variant,
                         icon,
                         title,
                         subtitle,
                     }: {
    variant: "orange" | "slate";
    icon: string;
    title: string;
    subtitle: string;
}) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <div
            className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                variant === "orange"
                    ? "bg-orange-500/15 text-orange-300"
                    : "bg-slate-700/60 text-slate-300"
            }`}
        >
            {icon}
        </div>

        <p
            className={`font-black ${
                variant === "orange" ? "text-orange-300" : "text-white"
            }`}
        >
            {title}
        </p>

        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
);

const InfoRow = ({
                     icon,
                     label,
                     value,
                     badge,
                 }: {
    icon: JSX.Element;
    label: string;
    value: string;
    badge?: string;
}) => (
    <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
            {icon}
            <span>{label}</span>
        </div>

        <div className="text-right">
            <p className="font-black text-white">{value}</p>
            {badge && (
                <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">
                    {badge}
                </span>
            )}
        </div>
    </div>
);

const TaskRow = ({ checked = false, label }: { checked?: boolean; label: string }) => (
    <div className="flex items-center gap-3 text-sm text-slate-300">
        <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
                checked
                    ? "border-slate-500 bg-slate-500 text-white"
                    : "border-slate-600"
            }`}
        >
            {checked ? "✓" : ""}
        </span>

        <span>{label}</span>
    </div>
);

const QuickAction = ({ icon, label }: { icon: JSX.Element; label: string }) => (
    <button className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-2 py-3 text-center text-xs text-slate-300 transition hover:border-sky-500/40 hover:bg-slate-800 hover:text-white">
        <span className="text-sky-300">{icon}</span>
        {label}
    </button>
);

const SmallEventCard = ({ event }: { event: CalendarEventResponse }) => (
    <div className="flex gap-3 rounded-2xl bg-slate-900/50 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
            <Users className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{event.title}</p>

            <p className="mt-1 text-sm text-slate-300">
                {formatDateTimeHour(event.startDateTime)} -{" "}
                {formatDateTimeHour(event.endDateTime)}
            </p>

            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>{eventTypeLabel[event.eventType]}</span>
                {event.location && <span className="text-sky-300">{event.location}</span>}
            </div>
        </div>
    </div>
);

const Legend = ({ color, label }: { color: string; label: string }) => (
    <span className="inline-flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
    </span>
);

export default MySchedulePage;