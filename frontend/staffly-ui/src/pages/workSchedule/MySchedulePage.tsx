import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Home,
    MapPin,
    Monitor,
    Plane,
    Users,
    Zap,
} from "lucide-react";

import {
    getCalendarEvents,
    getCompanyHolidays,
    getDepartmentWorkSchedulesByDepartment,
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
    DepartmentWorkScheduleResponse,
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

const workModelLabel: Record<WorkModel, string> = {
    OFFICE: "Ofis",
    HOME_OFFICE: "Home Office",
    HYBRID: "Hibrit",
    REMOTE: "Remote",
    DAY_OFF: "İzin Günü",
};

const workModelHeaderDotClass: Record<WorkModel, string> = {
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

const turkeyOfficialHolidays2026: Record<string, string> = {
    "2026-01-01": "Yılbaşı",
    "2026-03-19": "Ramazan Bayramı Arifesi",
    "2026-03-20": "Ramazan Bayramı 1. Gün",
    "2026-03-21": "Ramazan Bayramı 2. Gün",
    "2026-03-22": "Ramazan Bayramı 3. Gün",
    "2026-04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
    "2026-05-01": "Emek ve Dayanışma Günü",
    "2026-05-19": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
    "2026-05-26": "Kurban Bayramı Arifesi",
    "2026-05-27": "Kurban Bayramı 1. Gün",
    "2026-05-28": "Kurban Bayramı 2. Gün",
    "2026-05-29": "Kurban Bayramı 3. Gün",
    "2026-05-30": "Kurban Bayramı 4. Gün",
    "2026-07-15": "Demokrasi ve Millî Birlik Günü",
    "2026-08-30": "Zafer Bayramı",
    "2026-10-28": "Cumhuriyet Bayramı Arifesi",
    "2026-10-29": "Cumhuriyet Bayramı",
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

const calculateDurationMinutes = (start?: string | null, end?: string | null) => {
    if (!start || !end) return 0;

    const [startHour, startMinute] = start.slice(0, 5).split(":").map(Number);
    const [endHour, endMinute] = end.slice(0, 5).split(":").map(Number);

    return Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
};

const formatMinuteText = (minute: number) => {
    const hours = Math.floor(minute / 60);
    const minutes = minute % 60;

    if (hours > 0 && minutes > 0) return `${hours}s ${minutes}dk`;
    if (hours > 0) return `${hours}s`;
    return `${minutes}dk`;
};

const MySchedulePage = () => {
    const myUserId = getTokenUserId();

    const [employeeId, setEmployeeId] = useState("");
    const [departmentId, setDepartmentId] = useState<number | null>(null);

    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        getMonday(new Date())
    );

    const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([]);
    const [events, setEvents] = useState<CalendarEventResponse[]>([]);
    const [overtimes, setOvertimes] = useState<OvertimeResponse[]>([]);
    const [holidays, setHolidays] = useState<CompanyHolidayResponse[]>([]);
    const [departmentWorkSchedule, setDepartmentWorkSchedule] =
        useState<DepartmentWorkScheduleResponse | null>(null);
    const [error, setError] = useState("");

    const [visibleFilters, setVisibleFilters] = useState({
        workingHours: true,
        meetings: true,
        overtimes: true,
        holidays: true,
    });

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

                const [scheduleData, eventData, overtimeData, holidayData, departmentScheduleData] =
                    await Promise.all([
                        getEmployeeSchedule(Number(employeeId), startDate, endDate),
                        getCalendarEvents(`${startDate}T00:00:00`, `${endDate}T23:59:59`),
                        getEmployeeOvertimes(Number(employeeId), startDate, endDate),
                        getCompanyHolidays(),
                        departmentId != null
                            ? getDepartmentWorkSchedulesByDepartment(departmentId)
                            : Promise.resolve([]),
                    ]);

                setSchedules(scheduleData || []);
                setOvertimes(overtimeData || []);
                setHolidays(holidayData || []);
                setDepartmentWorkSchedule(
                    (departmentScheduleData || []).find((item) => item.active) ?? null
                );

                const visibleEvents = (eventData || []).filter((event) => {
                    const isParticipant = event.participants?.some(
                        (participant) => participant.employeeId === Number(employeeId)
                    );

                    const isDepartmentEvent =
                        departmentId != null && event.departmentId === departmentId;

                    const isGlobalEvent = event.departmentId == null;

                    return (
                        event.status === "ACTIVE" &&
                        event.eventType === "MEETING" &&
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
                setDepartmentWorkSchedule(null);
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

    const getHolidayByDate = (date: string) => {
        const companyHoliday = holidays.find(
            (holiday) => holiday.holidayDate === date && holiday.active
        );

        if (companyHoliday) {
            return {
                name: companyHoliday.name || "Resmi Tatil",
                description: companyHoliday.description || "Şirket tatili",
            };
        }

        const turkeyHoliday = turkeyOfficialHolidays2026[date];

        if (turkeyHoliday) {
            return {
                name: turkeyHoliday,
                description: "Türkiye resmi tatili",
            };
        }

        return null;
    };

    const weeklyStats = useMemo(() => {
        const office = schedules.filter((schedule) => schedule.workModel === "OFFICE").length;

        const homeOffice = schedules.filter(
            (schedule) => schedule.workModel === "HOME_OFFICE"
        ).length;

        const hybrid = schedules.filter(
            (schedule) => schedule.workModel === "HYBRID"
        ).length;

        const remote = schedules.filter(
            (schedule) => schedule.workModel === "REMOTE"
        ).length;

        const dayOff = schedules.filter(
            (schedule) => schedule.workModel === "DAY_OFF"
        ).length;

        const officialHolidayCount = weekDates.filter((date) =>
            getHolidayByDate(formatDate(date))
        ).length;

        const totalOvertimeMinutes = overtimes.reduce((total, overtime) => {
            return total + calculateDurationMinutes(overtime.startTime, overtime.endTime);
        }, 0);

        return {
            meetings: events.length,
            overtimeCount: overtimes.length,
            overtimeText: formatMinuteText(totalOvertimeMinutes),
            office,
            homeOffice,
            hybrid,
            remote,
            dayOff: dayOff + officialHolidayCount,
            officialHolidayCount,
        };
    }, [events, overtimes, schedules, weekDates, holidays]);

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
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                    <main className="min-w-0 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-white">
                                    Haftalık Takvimim
                                </h1>

                                <p className="mt-2 text-sm text-slate-400">
                                    Haftalık çalışma planı, departman çalışma saatleri, toplantılar ve ek mesailer.
                                </p>
                            </div>

                            <button
                                onClick={goCurrentWeek}
                                className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900 px-5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                <CalendarDays className="h-4 w-4" />
                                Bugüne Dön
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <SummaryCard
                                icon={<Users className="h-6 w-6" />}
                                iconClass="bg-purple-500/15 text-purple-300"
                                title="Toplantı Sayısı"
                                value={`${weeklyStats.meetings} Toplantı`}
                                description="Bu hafta"
                                accent="bg-purple-400"
                            />

                            <SummaryCard
                                icon={<Zap className="h-6 w-6" />}
                                iconClass="bg-violet-500/15 text-violet-300"
                                title="Fazla Mesai"
                                value={weeklyStats.overtimeText}
                                description={`${weeklyStats.overtimeCount} kayıt`}
                                accent="bg-violet-400"
                            />

                            <SummaryCard
                                icon={<Plane className="h-6 w-6" />}
                                iconClass="bg-orange-500/15 text-orange-300"
                                title="Resmi Tatil / İzin"
                                value={`${weeklyStats.dayOff} Gün`}
                                description={`${weeklyStats.officialHolidayCount} resmi tatil`}
                                accent="bg-orange-400"
                            />
                        </div>

                        <div className="mb-4 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900 px-4 py-2">
                                    <button
                                        onClick={goPreviousWeek}
                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    <div className="flex min-w-[230px] items-center justify-center gap-2 text-sm font-semibold text-slate-200">
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

                                <div className="flex flex-wrap items-center gap-2">
                                    <FilterChip
                                        active={visibleFilters.workingHours}
                                        label="Çalışma Saatleri"
                                        onClick={() =>
                                            setVisibleFilters((prev) => ({
                                                ...prev,
                                                workingHours: !prev.workingHours,
                                            }))
                                        }
                                    />

                                    <FilterChip
                                        active={visibleFilters.meetings}
                                        label="Toplantılar"
                                        onClick={() =>
                                            setVisibleFilters((prev) => ({
                                                ...prev,
                                                meetings: !prev.meetings,
                                            }))
                                        }
                                    />

                                    <FilterChip
                                        active={visibleFilters.overtimes}
                                        label="Ek Mesailer"
                                        onClick={() =>
                                            setVisibleFilters((prev) => ({
                                                ...prev,
                                                overtimes: !prev.overtimes,
                                            }))
                                        }
                                    />

                                    <FilterChip
                                        active={visibleFilters.holidays}
                                        label="Resmi Tatiller"
                                        onClick={() =>
                                            setVisibleFilters((prev) => ({
                                                ...prev,
                                                holidays: !prev.holidays,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <section className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70">
                            <div className="grid grid-cols-7 border-b border-slate-800/80">
                                {weekDates.map((date, index) => {
                                    const dateText = formatDate(date);
                                    const schedule = getScheduleByDate(dateText);
                                    const holiday = getHolidayByDate(dateText);

                                    return (
                                        <div
                                            key={dateText}
                                            className="min-h-[104px] border-l border-slate-800/80 bg-slate-900/40 px-3 py-4 text-center first:border-l-0"
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

                                            {visibleFilters.holidays && holiday ? (
                                                <p className="mx-auto mt-3 line-clamp-1 w-fit max-w-full rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-200">
                                                    {holiday.name}
                                                </p>
                                            ) : schedule ? (
                                                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${
                                                            workModelHeaderDotClass[
                                                                schedule.workModel
                                                                ]
                                                        }`}
                                                    />
                                                    {workModelLabel[schedule.workModel]}
                                                </div>
                                            ) : (
                                                <p className="mt-3 text-xs text-slate-500">
                                                    Çalışma Yok
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-7 items-stretch">
                                {weekDates.map((date) => {
                                    const dateText = formatDate(date);
                                    const schedule = getScheduleByDate(dateText);
                                    const dayEvents = getEventsByDate(dateText);
                                    const dayOvertimes = getOvertimesByDate(dateText);
                                    const holiday = getHolidayByDate(dateText);
                                    const hasWorkingHours =
                                        Boolean(departmentWorkSchedule) &&
                                        Boolean(schedule) &&
                                        schedule?.workModel !== "DAY_OFF";

                                    const hasVisibleData =
                                        hasWorkingHours ||
                                        Boolean(holiday) ||
                                        dayEvents.length > 0 ||
                                        dayOvertimes.length > 0;

                                    return (
                                        <div
                                            key={dateText}
                                            className="min-h-[300px] border-l border-slate-800/80 bg-slate-950/50 p-3 first:border-l-0"
                                        >
                                            <div className="flex h-full flex-col gap-3">
                                                {visibleFilters.holidays && holiday && (
                                                    <HolidayCard
                                                        title={holiday.name}
                                                        subtitle={holiday.description}
                                                    />
                                                )}

                                                {visibleFilters.workingHours &&
                                                    departmentWorkSchedule &&
                                                    schedule &&
                                                    schedule.workModel !== "DAY_OFF" && (
                                                        <DepartmentWorkingHourCard
                                                            schedule={departmentWorkSchedule}
                                                        />
                                                    )}

                                                {visibleFilters.meetings &&
                                                    dayEvents.map((event) => (
                                                        <EventCard
                                                            key={event.id}
                                                            event={event}
                                                        />
                                                    ))}

                                                {visibleFilters.overtimes &&
                                                    dayOvertimes.map((overtime) => (
                                                        <OvertimeCard
                                                            key={overtime.id}
                                                            overtime={overtime}
                                                        />
                                                    ))}

                                                {!hasVisibleData && <EmptyDayCard />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
                            <Legend color="bg-emerald-400" label="Çalışma Saati" />
                            <Legend color="bg-purple-400" label="Toplantı" />
                            <Legend color="bg-violet-400" label="Ek Mesai" />
                            <Legend color="bg-red-400" label="Resmi Tatil" />
                            <Legend color="bg-slate-500" label="Dinlenme Günü" />
                        </div>
                    </main>

                    <aside className="space-y-4">
                        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">
                                    Haftalık Özet
                                </h2>

                                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-300">
                                    Bu Hafta
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <WeeklyStatCard
                                    icon={<Users className="h-4 w-4" />}
                                    label="Toplantı"
                                    value={weeklyStats.meetings}
                                    colorClass="text-purple-300 bg-purple-500/10"
                                />

                                <WeeklyStatCard
                                    icon={<Zap className="h-4 w-4" />}
                                    label="Ek Mesai"
                                    value={weeklyStats.overtimeCount}
                                    colorClass="text-violet-300 bg-violet-500/10"
                                />

                                <WeeklyStatCard
                                    icon={<Monitor className="h-4 w-4" />}
                                    label="Ofis"
                                    value={weeklyStats.office}
                                    colorClass="text-emerald-300 bg-emerald-500/10"
                                />

                                <WeeklyStatCard
                                    icon={<Home className="h-4 w-4" />}
                                    label="Home Office"
                                    value={weeklyStats.homeOffice}
                                    colorClass="text-sky-300 bg-sky-500/10"
                                />

                                <WeeklyStatCard
                                    icon={<Clock3 className="h-4 w-4" />}
                                    label="Hibrit"
                                    value={weeklyStats.hybrid}
                                    colorClass="text-purple-300 bg-purple-500/10"
                                />

                                <WeeklyStatCard
                                    icon={<Monitor className="h-4 w-4" />}
                                    label="Remote"
                                    value={weeklyStats.remote}
                                    colorClass="text-cyan-300 bg-cyan-500/10"
                                />

                                <WeeklyStatCard
                                    icon={<Plane className="h-4 w-4" />}
                                    label="İzin"
                                    value={weeklyStats.dayOff}
                                    colorClass="text-orange-300 bg-orange-500/10"
                                />

                                <WeeklyStatCard
                                    icon={<CalendarDays className="h-4 w-4" />}
                                    label="Resmi Tatil"
                                    value={weeklyStats.officialHolidayCount}
                                    colorClass="text-red-300 bg-red-500/10"
                                />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">
                                    Toplantılar
                                </h2>

                                <span className="rounded-lg bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-300">
                                    {events.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {events.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Bu hafta toplantı bulunmuyor.
                                    </p>
                                ) : (
                                    events.slice(0, 5).map((event) => (
                                        <SmallEventCard key={event.id} event={event} />
                                    ))
                                )}
                            </div>
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
                         accent,
                     }: {
    icon: ReactNode;
    iconClass: string;
    title: string;
    value: string;
    description: string;
    accent: string;
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
            <div className={`h-full w-2/3 rounded-full ${accent}`} />
        </div>
    </div>
);

const FilterChip = ({
                        active,
                        label,
                        onClick,
                    }: {
    active: boolean;
    label: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
            active
                ? "border-sky-500/40 bg-sky-500/15 text-sky-200"
                : "border-slate-700/70 bg-slate-900/70 text-slate-500 hover:text-slate-300"
        }`}
    >
        {label}
    </button>
);

const DepartmentWorkingHourCard = ({
                                       schedule,
                                   }: {
    schedule: DepartmentWorkScheduleResponse;
}) => (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-xs text-emerald-100 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-emerald-300" />
                <p className="font-black">Departman Çalışma Saatleri</p>
            </div>

            <p className="text-sm font-black text-white">
                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            </p>

            {schedule.breakStartTime && schedule.breakEndTime && (
                <p className="mt-1 text-[11px] text-emerald-100/75">
                    Mola: {formatTime(schedule.breakStartTime)} -{" "}
                    {formatTime(schedule.breakEndTime)}
                </p>
            )}
        </div>
);

const EventCard = ({ event }: { event: CalendarEventResponse }) => (
    <div className="rounded-2xl border border-purple-500/40 bg-purple-500/15 px-3 py-3 text-xs text-purple-100 shadow-sm">
        <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-400/20 text-purple-200">
                <Users className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-black leading-snug">
                    {event.title}
                </p>

                <p className="mt-1 font-semibold opacity-90">
                    {formatDateTimeHour(event.startDateTime)} -{" "}
                    {formatDateTimeHour(event.endDateTime)}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-1.5 opacity-75">
                    <span>{eventTypeLabel[event.eventType]}</span>

                    {event.location && (
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const OvertimeCard = ({ overtime }: { overtime: OvertimeResponse }) => (
    <div className="rounded-2xl border border-violet-500/40 bg-violet-500/15 px-3 py-3 text-xs text-violet-100 shadow-sm">
        <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-400/20 text-violet-200">
                <Zap className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="font-black">Ek Mesai</p>

                <p className="mt-1 font-semibold opacity-90">
                    {formatTime(overtime.startTime)} - {formatTime(overtime.endTime)}
                </p>

                {overtime.reason && (
                    <p className="mt-1 line-clamp-2 opacity-75">
                        {overtime.reason}
                    </p>
                )}
            </div>
        </div>
    </div>
);

const HolidayCard = ({
                         title,
                         subtitle,
                     }: {
    title: string;
    subtitle: string;
}) => (
    <div className="rounded-2xl border border-red-500/35 bg-red-500/15 px-3 py-3 text-xs text-red-100 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-400/15 text-base">
                🇹🇷
            </span>

            <div className="min-w-0">
                <p className="line-clamp-2 font-black">{title}</p>
                <p className="mt-0.5 line-clamp-1 opacity-75">{subtitle}</p>
            </div>
        </div>
    </div>
);

const EmptyDayCard = () => (
    <div className="flex min-h-[230px] flex-1 items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-900/40 px-3 py-6 text-center text-xs text-slate-400">
        <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50 text-3xl">
                🏖️
            </div>

            <p className="text-sm font-black text-white">
                Dinlenme Günü
            </p>

            <p className="mt-1 text-xs text-slate-400">
                Çalışma planı yok
            </p>
        </div>
    </div>
);

const WeeklyStatCard = ({
                            icon,
                            label,
                            value,
                            colorClass,
                        }: {
    icon: ReactNode;
    label: string;
    value: number;
    colorClass: string;
}) => (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3">
        <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${colorClass}`}>
            {icon}
        </div>

        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
);

const SmallEventCard = ({ event }: { event: CalendarEventResponse }) => (
    <div className="flex gap-3 rounded-2xl bg-slate-900/50 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
            <Users className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-bold text-white">{event.title}</p>

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
