import { useEffect, useMemo, useState } from "react";
import {
    getCalendarEvents,
    getCompanyHolidays,
    getEmployeeOvertimes,
    getEmployeeSchedule,
    getEmployees,
} from "../../services/workScheduleService";

import type {
    CalendarEventResponse,
    CompanyHolidayResponse,
    EmployeeResponse,
    OvertimeResponse,
    WorkModel,
    WorkScheduleResponse,
} from "../../types/workScheduleTypes";

const cardClass =
    "rounded-3xl border border-slate-800/80 bg-slate-950/70 shadow-[0_0_35px_rgba(15,23,42,0.75)] p-5";

const inputClass =
    "rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400";

const buttonClass =
    "rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-5 py-3 text-sm transition";

const badgeClass: Record<WorkModel, string> = {
    OFFICE: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    HOME_OFFICE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    HYBRID: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    REMOTE: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    DAY_OFF: "bg-slate-500/10 text-slate-300 border-slate-500/30",
};

const workModelLabel: Record<WorkModel, string> = {
    OFFICE: "Ofis",
    HOME_OFFICE: "Home Office",
    HYBRID: "Hibrit",
    REMOTE: "Remote",
    DAY_OFF: "Tatil / Off Day",
};

const dayNames = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
];

const getMonday = (date: Date) => {
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    current.setDate(diff);
    return current;
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const MySchedulePage = () => {
    const [employeeId, setEmployeeId] = useState("");

    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([]);
    const [events, setEvents] = useState<CalendarEventResponse[]>([]);
    const [overtimes, setOvertimes] = useState<OvertimeResponse[]>([]);
    const [holidays, setHolidays] = useState<CompanyHolidayResponse[]>([]);

    const [error, setError] = useState("");

    const weekDates = useMemo(() => {
        const monday = getMonday(new Date());

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return date;
        });
    }, []);

    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);

    const selectedEmployee = employees.find(
        (employee) => employee.id === Number(employeeId)
    );

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                setError("");

                const employeeData = await getEmployees();
                setEmployees(employeeData || []);

                if (employeeData && employeeData.length > 0) {
                    setEmployeeId(String(employeeData[0].id));
                }
            } catch (err) {
                console.error(err);
                setError("Çalışanlar alınamadı.");
            }
        };

        loadEmployees();
    }, []);

    useEffect(() => {
        if (employeeId && employees.length > 0) {
            loadCalendar();
        }
    }, [employeeId, employees.length]);

    const loadCalendar = async () => {
        try {
            setError("");

            if (!employeeId) {
                setError("Lütfen çalışan seç.");
                return;
            }

            const currentEmployee = employees.find(
                (employee) => employee.id === Number(employeeId)
            );

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

            const filteredEvents = (eventData || []).filter((event) => {
                const isParticipant = event.participants?.some(
                    (participant) => participant.employeeId === Number(employeeId)
                );

                const isDepartmentEvent =
                    currentEmployee?.departmentId &&
                    event.departmentId === currentEmployee.departmentId;

                return isParticipant || isDepartmentEvent;
            });

            setEvents(filteredEvents);
        } catch (err) {
            console.error(err);
            setSchedules([]);
            setEvents([]);
            setOvertimes([]);
            setError("Takvim verileri alınamadı.");
        }
    };

    const getScheduleByDate = (date: string) => {
        return schedules.find((schedule) => schedule.workDate === date);
    };

    const getEventsByDate = (date: string) => {
        return events.filter((event) => event.startDateTime?.startsWith(date));
    };

    const getOvertimesByDate = (date: string) => {
        return overtimes.filter((overtime) => overtime.overtimeDate === date);
    };

    const getHolidayByDate = (date: string) => {
        return holidays.find(
            (holiday) => holiday.holidayDate === date && holiday.active
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-6 overflow-y-auto staffly-scroll">
            <div className="mb-6 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                <div>
                    <p className="text-sm text-sky-400 font-semibold tracking-[0.25em] uppercase">
                        My Calendar
                    </p>
                    <h1 className="text-3xl font-bold mt-2">Haftalık Takvimim</h1>
                    <p className="text-slate-400 text-sm mt-2">
                        Çalışma planı, ek mesai, toplantı ve şirket tatillerini görüntüle.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <select
                        className={inputClass}
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    >
                        <option value="">Çalışan seç</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.firstName} {employee.lastName}
                            </option>
                        ))}
                    </select>

                    <button onClick={loadCalendar} className={buttonClass}>
                        Takvimi Getir
                    </button>
                </div>
            </div>

            {selectedEmployee && (
                <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 text-sm text-slate-300">
                    Görüntülenen çalışan:{" "}
                    <span className="text-sky-300 font-semibold">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </span>
                </div>
            )}

            {error && (
                <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                    const dateText = formatDate(date);
                    const schedule = getScheduleByDate(dateText);
                    const dayEvents = getEventsByDate(dateText);
                    const dayOvertimes = getOvertimesByDate(dateText);
                    const holiday = getHolidayByDate(dateText);

                    return (
                        <div key={dateText} className={cardClass}>
                            <div className="mb-4">
                                <p className="text-xs text-sky-400 font-semibold">
                                    {dayNames[index]}
                                </p>
                                <h2 className="font-bold mt-1">{dateText}</h2>
                            </div>

                            {holiday && (
                                <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3">
                                    <p className="text-xs text-red-300 font-semibold">
                                        Şirket Tatili
                                    </p>
                                    <p className="text-sm text-slate-200 mt-1">
                                        {holiday.name}
                                    </p>
                                    {holiday.description && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            {holiday.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {schedule ? (
                                <div className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-100">
                                            Çalışma Planı
                                        </p>

                                        <span
                                            className={`text-xs px-2 py-1 rounded-full border ${
                                                badgeClass[schedule.workModel]
                                            }`}
                                        >
                                            {workModelLabel[schedule.workModel]}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-400 mt-2">
                                        {schedule.shift?.name}
                                    </p>

                                    {schedule.shift?.breakStartTime &&
                                        schedule.shift?.breakEndTime && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Öğle:{" "}
                                                {schedule.shift.breakStartTime.slice(0, 5)} -{" "}
                                                {schedule.shift.breakEndTime.slice(0, 5)}
                                            </p>
                                        )}

                                    {schedule.note && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            {schedule.note}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-3">
                                    <p className="text-xs text-slate-500">
                                        Çalışma planı yok
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {dayOvertimes.map((overtime) => (
                                    <div
                                        key={overtime.id}
                                        className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3"
                                    >
                                        <p className="text-xs text-orange-300 font-semibold">
                                            Ek Mesai
                                        </p>
                                        <p className="text-sm text-slate-200 mt-1">
                                            {overtime.startTime.slice(0, 5)} -{" "}
                                            {overtime.endTime.slice(0, 5)}
                                        </p>
                                        {overtime.reason && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                {overtime.reason}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-1">
                                            Durum: {overtime.status}
                                        </p>
                                    </div>
                                ))}

                                {dayEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3"
                                    >
                                        <p className="text-xs text-sky-300 font-semibold">
                                            {event.eventType}
                                        </p>
                                        <p className="text-sm text-slate-200 mt-1">
                                            {event.title}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {event.startDateTime.slice(11, 16)} -{" "}
                                            {event.endDateTime.slice(11, 16)}
                                        </p>
                                        {event.location && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Konum: {event.location}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MySchedulePage;