import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { tr } from "date-fns/locale/tr";

import "react-datepicker/dist/react-datepicker.css";

import {
    CalendarDays,
    ChevronDown,
    Clock3,
    Edit3,
    GraduationCap,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    UserRound,
    Video,
    X,
    BriefcaseBusiness,
    MessageSquare,
    Ban,
} from "lucide-react";

import {
    cancelCalendarEvent,
    createCalendarEvent,
    deleteCalendarEvent,
    getCalendarEvents,
    getDepartments,
    updateCalendarEvent,
} from "../../services/workScheduleService";

import type {
    CalendarEventResponse,
    DepartmentResponse,
    EventType,
} from "../../types/workScheduleTypes";

import ConfirmModal from "../../components/common/ConfirmModal";

registerLocale("tr", tr);

type SortType = "DATE_ASC" | "DATE_DESC";

type ConfirmAction = "save" | "cancel" | "delete" | null;

const eventTypeLabels: Record<EventType, string> = {
    MEETING: "Toplantı",
    TRAINING: "Eğitim",
    INTERVIEW: "Mülakat",
    COMPANY_EVENT: "Şirket Etkinliği",
    OTHER: "Diğer",
};

const eventTypeConfig: Record<
    EventType,
    {
        icon: JSX.Element;
        badge: string;
        iconBox: string;
        dot: string;
    }
> = {
    MEETING: {
        icon: <BriefcaseBusiness className="h-5 w-5" />,
        badge: "border-sky-400/40 bg-sky-500/10 text-sky-300",
        iconBox: "bg-sky-500/15 text-sky-300",
        dot: "bg-sky-400",
    },
    INTERVIEW: {
        icon: <UserRound className="h-5 w-5" />,
        badge: "border-violet-400/40 bg-violet-500/10 text-violet-300",
        iconBox: "bg-violet-500/15 text-violet-300",
        dot: "bg-violet-400",
    },
    TRAINING: {
        icon: <GraduationCap className="h-5 w-5" />,
        badge: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
        iconBox: "bg-emerald-500/15 text-emerald-300",
        dot: "bg-emerald-400",
    },
    COMPANY_EVENT: {
        icon: <CalendarDays className="h-5 w-5" />,
        badge: "border-orange-400/40 bg-orange-500/10 text-orange-300",
        iconBox: "bg-orange-500/15 text-orange-300",
        dot: "bg-orange-400",
    },
    OTHER: {
        icon: <MessageSquare className="h-5 w-5" />,
        badge: "border-cyan-400/40 bg-cyan-500/10 text-cyan-300",
        iconBox: "bg-cyan-500/15 text-cyan-300",
        dot: "bg-cyan-400",
    },
};

const inputClass =
    "h-12 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 [&>option]:bg-slate-950 [&>option]:text-slate-100";

const modalInputClass =
    "w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 [&>option]:bg-slate-950 [&>option]:text-slate-100";

const buttonClass =
    "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
    "inline-flex items-center justify-center rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
    "inline-flex items-center justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60";

const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const parseLocalDate = (value: string) => {
    return new Date(`${value}T12:00:00`);
};

const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

const dateToDateTimeLocal = (date: Date, time: string) => {
    return `${formatDateValue(date)}T${time}`;
};

const formatDate = (value: string) => {
    if (!value) return "-";

    const datePart = value.slice(0, 10);
    const date = parseLocalDate(datePart);

    return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatTime = (value: string) => {
    if (!value) return "-";
    return value.slice(11, 16);
};

const formatMonthTitle = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
    });
};

const getDateOnlyFromDateTime = (value: string) => {
    return value.slice(0, 10);
};

const isPastDateString = (value: string) => {
    const today = startOfToday();
    const date = parseLocalDate(value);
    date.setHours(0, 0, 0, 0);

    return date < today;
};

const MeetingPlanningPage = () => {
    const todayDate = useMemo(() => startOfToday(), []);
    const today = useMemo(() => formatDateValue(todayDate), [todayDate]);

    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [events, setEvents] = useState<CalendarEventResponse[]>([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] =
        useState<CalendarEventResponse | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalLoading, setConfirmModalLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const [actionTarget, setActionTarget] =
        useState<CalendarEventResponse | null>(null);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [filter, setFilter] = useState({
        search: "",
        eventType: "ALL",
        departmentId: "ALL",
        sort: "DATE_ASC" as SortType,
    });

    const [calendarDate, setCalendarDate] = useState<Date>(todayDate);

    const [eventForm, setEventForm] = useState({
        title: "",
        description: "",
        eventType: "MEETING" as EventType,
        startDate: todayDate,
        startTime: "09:00",
        endDate: todayDate,
        endTime: "10:00",
        location: "",
        onlineMeetingUrl: "",
        departmentId: "",
    });

    const eventTypes: EventType[] = [
        "MEETING",
        "INTERVIEW",
        "TRAINING",
        "COMPANY_EVENT",
        "OTHER",
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!message && !error) return;

        const timer = window.setTimeout(() => {
            setMessage("");
            setError("");
        }, 3500);

        return () => window.clearTimeout(timer);
    }, [message, error]);

    const showSuccess = (text: string) => {
        setMessage(text);
        setError("");
    };

    const showError = (err: unknown, fallback: string) => {
        const apiError = err as { response?: { data?: { message?: string } } };

        setMessage("");
        setError(apiError.response?.data?.message || fallback);
    };



    const loadEvents = async () => {
        try {
            const data = await getCalendarEvents(
                `${today}T00:00:00`,
                "2999-12-31T23:59:59"
            );

            setEvents(data);
            setError("");
        } catch (err) {
            showError(err, "Etkinlikler getirilemedi.");
        }
    };

    const loadInitialData = async () => {
        try {
            const [departmentData, eventData] = await Promise.all([
                getDepartments(),
                getCalendarEvents(`${today}T00:00:00`, `${today}T23:59:59`),
            ]);

            setDepartments(departmentData);
            setEvents(eventData);
        } catch (err) {
            showError(err, "Veriler yüklenirken hata oluştu.");
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);



    const getDepartmentName = (departmentId: number | null) => {
        if (!departmentId) return "Departman yok";

        return (
            departments.find((item) => item.id === departmentId)?.name ||
            `Departman #${departmentId}`
        );
    };

    const resetForm = () => {
        setSelectedEvent(null);
        setEventForm({
            title: "",
            description: "",
            eventType: "MEETING",
            startDate: todayDate,
            startTime: "09:00",
            endDate: todayDate,
            endTime: "10:00",
            location: "",
            onlineMeetingUrl: "",
            departmentId: "",
        });
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (confirmModalLoading) return;

        resetForm();
        setIsModalOpen(false);
    };

    const openEditEvent = (event: CalendarEventResponse) => {
        setSelectedEvent(event);

        const startDateValue = getDateOnlyFromDateTime(event.startDateTime);
        const endDateValue = getDateOnlyFromDateTime(event.endDateTime);

        setEventForm({
            title: event.title,
            description: event.description || "",
            eventType: event.eventType,
            startDate: parseLocalDate(startDateValue),
            startTime: formatTime(event.startDateTime),
            endDate: parseLocalDate(endDateValue),
            endTime: formatTime(event.endDateTime),
            location: event.location || "",
            onlineMeetingUrl: event.onlineMeetingUrl || "",
            departmentId: event.departmentId ? String(event.departmentId) : "",
        });

        setOpenMenuId(null);
        setIsModalOpen(true);
    };

    const handleStartDateChange = (date: Date | null) => {
        if (!date) return;

        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);

        setEventForm((prev) => {
            const shouldUpdateEndDate = prev.endDate < normalized;

            return {
                ...prev,
                startDate: normalized,
                endDate: shouldUpdateEndDate ? normalized : prev.endDate,
            };
        });
    };

    const handleEndDateChange = (date: Date | null) => {
        if (!date) return;

        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);

        setEventForm((prev) => ({
            ...prev,
            endDate: normalized,
        }));
    };

    const handleStartTimeChange = (value: string) => {
        setEventForm((prev) => {
            const sameDay =
                formatDateValue(prev.startDate) === formatDateValue(prev.endDate);

            return {
                ...prev,
                startTime: value,
                endTime: sameDay && prev.endTime <= value ? value : prev.endTime,
            };
        });
    };

    const validateEventForm = () => {
        if (!eventForm.title.trim()) {
            setMessage("");
            setError("Etkinlik başlığı boş bırakılamaz.");
            return false;
        }

        if (eventForm.startDate < todayDate || eventForm.endDate < todayDate) {
            setMessage("");
            setError("Geçmiş tarihli etkinlik oluşturamazsın.");
            return false;
        }

        if (!eventForm.startTime || !eventForm.endTime) {
            setMessage("");
            setError("Başlangıç ve bitiş saatini seçmelisin.");
            return false;
        }

        const startDateTime = dateToDateTimeLocal(
            eventForm.startDate,
            eventForm.startTime
        );

        const endDateTime = dateToDateTimeLocal(
            eventForm.endDate,
            eventForm.endTime
        );

        if (endDateTime <= startDateTime) {
            setMessage("");
            setError("Bitiş tarihi ve saati başlangıçtan sonra olmalıdır.");
            return false;
        }

        setError("");
        return true;
    };

    const openSaveConfirm = () => {
        const isValid = validateEventForm();

        if (!isValid) return;

        setConfirmAction("save");
        setConfirmModalOpen(true);
    };

    const openCancelConfirm = (event: CalendarEventResponse) => {
        setActionTarget(event);
        setConfirmAction("cancel");
        setConfirmModalOpen(true);
        setOpenMenuId(null);
    };

    const openDeleteConfirm = (event: CalendarEventResponse) => {
        setActionTarget(event);
        setConfirmAction("delete");
        setConfirmModalOpen(true);
        setOpenMenuId(null);
    };

    const closeConfirmModal = () => {
        if (confirmModalLoading) return;

        setConfirmModalOpen(false);
        setConfirmAction(null);
        setActionTarget(null);
    };

    const handleCreateOrUpdateEvent = async () => {
        const payload = {
            title: eventForm.title.trim(),
            description: eventForm.description,
            eventType: eventForm.eventType,
            startDateTime: dateToDateTimeLocal(
                eventForm.startDate,
                eventForm.startTime
            ),
            endDateTime: dateToDateTimeLocal(eventForm.endDate, eventForm.endTime),
            location: eventForm.location,
            onlineMeetingUrl: eventForm.onlineMeetingUrl,
            departmentId: eventForm.departmentId
                ? Number(eventForm.departmentId)
                : null,
        };

        if (selectedEvent) {
            await updateCalendarEvent(selectedEvent.id, payload);
            showSuccess("Etkinlik güncellendi.");
        } else {
            await createCalendarEvent({
                ...payload,
                participantIds: [],
            });

            showSuccess("Etkinlik oluşturuldu.");
        }

        closeModal();
        await loadEvents();
    };

    const handleCancelEvent = async () => {
        if (!actionTarget) return;

        await cancelCalendarEvent(actionTarget.id);
        showSuccess("Etkinlik iptal edildi.");
        await loadEvents();
    };

    const handleDeleteEvent = async () => {
        if (!actionTarget) return;

        await deleteCalendarEvent(actionTarget.id);
        showSuccess("Etkinlik silindi.");
        await loadEvents();
    };

    const handleConfirmAction = async () => {
        try {
            setConfirmModalLoading(true);

            if (confirmAction === "save") {
                await handleCreateOrUpdateEvent();
            }

            if (confirmAction === "cancel") {
                await handleCancelEvent();
            }

            if (confirmAction === "delete") {
                await handleDeleteEvent();
            }

            setConfirmModalOpen(false);
            setConfirmAction(null);
            setActionTarget(null);
        } catch (err) {
            if (confirmAction === "save") {
                showError(err, "Etkinlik kaydedilemedi.");
            }

            if (confirmAction === "cancel") {
                showError(err, "Etkinlik iptal edilemedi.");
            }

            if (confirmAction === "delete") {
                showError(err, "Etkinlik silinemedi.");
            }
        } finally {
            setConfirmModalLoading(false);
        }
    };




    const handleCalendarDateChange = (date: Date | null) => {
        if (!date) return;

        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);

        setCalendarDate(normalized);
    };

    const resetFilters = () => {
        setFilter({
            search: "",
            eventType: "ALL",
            departmentId: "ALL",
            sort: "DATE_ASC",
        });

        setCalendarDate(todayDate);
    };

    const filteredEvents = useMemo(() => {
        const searchValue = filter.search.trim().toLowerCase();

        return events
            .filter((event) => {
                const matchesSearch =
                    !searchValue ||
                    event.title?.toLowerCase().includes(searchValue);

                const matchesType =
                    filter.eventType === "ALL" ||
                    event.eventType === filter.eventType;

                const matchesDepartment =
                    filter.departmentId === "ALL" ||
                    String(event.departmentId) === filter.departmentId;

                return matchesSearch && matchesType && matchesDepartment;
            })
            .sort((a, b) => {
                if (filter.sort === "DATE_ASC") {
                    return a.startDateTime.localeCompare(b.startDateTime);
                }

                return b.startDateTime.localeCompare(a.startDateTime);
            });
    }, [events, filter]);

    const stats = useMemo(() => {
        const meetingsToday = events.filter(
            (event) =>
                getDateOnlyFromDateTime(event.startDateTime) === today &&
                event.eventType === "MEETING"
        ).length;

        const weekLimit = new Date(todayDate);
        weekLimit.setDate(weekLimit.getDate() + 7);

        const upcoming = events.filter((event) => {
            const eventDate = parseLocalDate(
                getDateOnlyFromDateTime(event.startDateTime)
            );

            return eventDate >= todayDate && eventDate <= weekLimit;
        }).length;

        const trainings = events.filter(
            (event) => event.eventType === "TRAINING"
        ).length;

        const activeEvents = events.filter(
            (event) => event.status !== "CANCELLED"
        ).length;

        return {
            meetingsToday,
            upcoming,
            trainings,
            activeEvents,
        };
    }, [events, today, todayDate]);

    const eventCounts = useMemo(() => {
        return {
            ALL: events.length,
            MEETING: events.filter((event) => event.eventType === "MEETING").length,
            INTERVIEW: events.filter((event) => event.eventType === "INTERVIEW").length,
            TRAINING: events.filter((event) => event.eventType === "TRAINING").length,
            COMPANY_EVENT: events.filter(
                (event) => event.eventType === "COMPANY_EVENT"
            ).length,
            OTHER: events.filter((event) => event.eventType === "OTHER").length,
        };
    }, [events]);

    const eventDateSet = useMemo(() => {
        return new Set(
            events.map((event) => getDateOnlyFromDateTime(event.startDateTime))
        );
    }, [events]);

    const getStatusBadge = (status: string) => {
        if (status === "CANCELLED") {
            return "border-red-400/30 bg-red-500/10 text-red-300";
        }

        if (status === "ACTIVE") {
            return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
        }

        return "border-blue-400/30 bg-blue-500/10 text-blue-300";
    };

    const getStatusLabel = (status: string) => {
        if (status === "CANCELLED") return "İptal";
        if (status === "ACTIVE") return "Onaylandı";
        return status;
    };

    const getConfirmModalProps = () => {
        if (confirmAction === "delete") {
            return {
                variant: "danger" as const,
                title: "Etkinliği Sil",
                description: "Bu etkinlik sistemden silinecek.",
                detailText:
                    "Silme işleminden sonra etkinlik listede görünmez. Bu işlem geri alınamayabilir.",
                itemName: actionTarget?.title,
                confirmText: "Evet, Sil",
            };
        }

        if (confirmAction === "cancel") {
            return {
                variant: "warning" as const,
                title: "Etkinliği İptal Et",
                description: "Bu etkinlik iptal durumuna alınacak.",
                detailText:
                    "İptal edilen etkinlik listede görünebilir fakat aktif etkinlik olarak değerlendirilmez.",
                itemName: actionTarget?.title,
                confirmText: "Evet, İptal Et",
            };
        }

        return {
            variant: "success" as const,
            title: selectedEvent ? "Etkinliği Güncelle" : "Etkinlik Oluştur",
            description: selectedEvent
                ? "Seçili etkinlik yeni bilgilerle güncellenecek."
                : "Yeni etkinlik oluşturulacak.",
            detailText:
                "Onayladıktan sonra etkinlik bilgileri sisteme kaydedilecek ve liste otomatik güncellenecek.",
            itemName: eventForm.title || undefined,
            confirmText: selectedEvent ? "Evet, Güncelle" : "Evet, Oluştur",
        };
    };

    const confirmProps = getConfirmModalProps();

    return (
        <div className="min-h-full w-full bg-[#020617] p-0 text-slate-100">
            <div className="flex min-h-screen w-full flex-col bg-slate-950/40 p-5">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1.7fr] xl:items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white">
                                Toplantı & Etkinlik Yönetimi
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                Toplantı, eğitim, mülakat ve şirket etkinliklerini oluştur,
                                düzenle, iptal et ve takvim üzerinden takip et.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                icon={<CalendarDays className="h-6 w-6" />}
                                iconClass="bg-sky-500/15 text-sky-300"
                                title="Bugünkü Toplantılar"
                                value={stats.meetingsToday}
                                subtitle="Bugün"
                                subtitleClass="text-sky-400"
                            />

                            <StatCard
                                icon={<Clock3 className="h-6 w-6" />}
                                iconClass="bg-violet-500/15 text-violet-300"
                                title="Yaklaşan Etkinlikler"
                                value={stats.upcoming}
                                subtitle="7 gün içinde"
                                subtitleClass="text-violet-300"
                            />

                            <StatCard
                                icon={<GraduationCap className="h-6 w-6" />}
                                iconClass="bg-emerald-500/15 text-emerald-300"
                                title="Eğitimler"
                                value={stats.trainings}
                                subtitle="Planlanan"
                                subtitleClass="text-emerald-300"
                            />

                            <StatCard
                                icon={<CalendarDays className="h-6 w-6" />}
                                iconClass="bg-orange-500/15 text-orange-300"
                                title="Aktif Etkinlik"
                                value={stats.activeEvents}
                                subtitle="Toplam"
                                subtitleClass="text-orange-300"
                            />
                        </div>
                    </div>
                </div>

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

                <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
                    <main className="min-w-0">
                        <section className="mb-5 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.75fr_0.75fr_0.9fr_auto_auto]">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                    <input
                                        className={`${inputClass} pr-12`}
                                        placeholder="Etkinlik adına göre ara..."
                                        value={filter.search}
                                        onChange={(e) =>
                                            setFilter((prev) => ({
                                                ...prev,
                                                search: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <select
                                    className={inputClass}
                                    value={filter.eventType}
                                    onChange={(e) =>
                                        setFilter((prev) => ({
                                            ...prev,
                                            eventType: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="ALL">Tüm Türler</option>
                                    {eventTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {eventTypeLabels[type]}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className={inputClass}
                                    value={filter.departmentId}
                                    onChange={(e) =>
                                        setFilter((prev) => ({
                                            ...prev,
                                            departmentId: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="ALL">Tüm Departmanlar</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className={inputClass}
                                    value={filter.sort}
                                    onChange={(e) =>
                                        setFilter((prev) => ({
                                            ...prev,
                                            sort: e.target.value as SortType,
                                        }))
                                    }
                                >
                                    <option value="DATE_ASC">Tarih: Yakından Uzağa</option>
                                    <option value="DATE_DESC">Tarih: Uzaktan Yakına</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900 px-5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    Tüm Filtreleri Kaldır
                                </button>

                                <button className={buttonClass} onClick={openCreateModal}>
                                    <Plus className="h-5 w-5" />
                                    Yeni Etkinlik
                                </button>
                            </div>
                        </section>

                        <section className="overflow-visible rounded-3xl border border-slate-800/80 bg-slate-950/70 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                            <div className="flex flex-col gap-4 border-b border-slate-800/80 p-5 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Etkinlikler
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Tüm toplantı ve etkinliklerin listesi.
                                    </p>
                                </div>

                                <span className="rounded-full border border-slate-700/80 bg-slate-900 px-4 py-2 text-sm text-slate-300">
                                    Toplam: {filteredEvents.length}
                                </span>
                            </div>

                            <div className="flex gap-3 overflow-x-auto border-b border-slate-800/80 px-5 py-4 staffly-scroll">
                                <button
                                    onClick={() =>
                                        setFilter((prev) => ({
                                            ...prev,
                                            eventType: "ALL",
                                        }))
                                    }
                                    className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                        filter.eventType === "ALL"
                                            ? "border-sky-400/40 bg-sky-500/10 text-sky-300"
                                            : "border-slate-700/80 bg-slate-900 text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Tümü ({eventCounts.ALL})
                                </button>

                                {eventTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() =>
                                            setFilter((prev) => ({
                                                ...prev,
                                                eventType: type,
                                            }))
                                        }
                                        className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                            filter.eventType === type
                                                ? eventTypeConfig[type].badge
                                                : "border-slate-700/80 bg-slate-900 text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {eventTypeLabels[type]} ({eventCounts[type]})
                                    </button>
                                ))}
                            </div>

                            <div className="overflow-x-auto staffly-scroll">
                                <table className="w-full min-w-[900px]">
                                    <thead>
                                    <tr className="border-b border-slate-800/80 bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-400">
                                        <th className="px-5 py-4">Etkinlik</th>
                                        <th className="px-4 py-4">Tür</th>
                                        <th className="px-4 py-4">Tarih & Saat</th>
                                        <th className="px-4 py-4">Lokasyon</th>
                                        <th className="px-4 py-4">Durum</th>
                                        <th className="px-5 py-4 text-right">İşlemler</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {filteredEvents.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-14">
                                                <div className="rounded-3xl border border-dashed border-slate-700/80 bg-slate-900/50 p-8 text-center">
                                                    <p className="font-semibold text-slate-200">
                                                        Etkinlik bulunamadı.
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Yeni etkinlik oluşturabilir veya filtreleri değiştirebilirsin.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEvents.map((event) => {
                                            const config =
                                                eventTypeConfig[event.eventType];

                                            return (
                                                <tr
                                                    key={event.id}
                                                    className="border-b border-slate-800/80 transition hover:bg-slate-900/60"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.iconBox}`}
                                                            >
                                                                {config.icon}
                                                            </div>

                                                            <div>
                                                                <p className="font-bold text-white">
                                                                    {event.title}
                                                                </p>

                                                                <p className="mt-1 text-sm text-slate-400">
                                                                    {getDepartmentName(
                                                                        event.departmentId
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                            <span
                                                                className={`inline-flex rounded-xl border px-3 py-1 text-xs font-bold ${config.badge}`}
                                                            >
                                                                {
                                                                    eventTypeLabels[
                                                                        event.eventType
                                                                        ]
                                                                }
                                                            </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <p className="font-bold text-white">
                                                            {formatDate(
                                                                event.startDateTime
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {formatTime(
                                                                event.startDateTime
                                                            )}{" "}
                                                            -{" "}
                                                            {formatTime(
                                                                event.endDateTime
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                                            {event.onlineMeetingUrl ? (
                                                                <Video className="h-4 w-4 text-slate-500" />
                                                            ) : (
                                                                <MapPin className="h-4 w-4 text-slate-500" />
                                                            )}

                                                            <span>
                                                                    {event.location ||
                                                                        (event.onlineMeetingUrl
                                                                            ? "Online"
                                                                            : "Lokasyon yok")}
                                                                </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                            <span
                                                                className={`inline-flex rounded-xl border px-3 py-1 text-xs font-bold ${getStatusBadge(
                                                                    event.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    event.status
                                                                )}
                                                            </span>
                                                    </td>

                                                    <td className="relative px-5 py-4 text-right">
                                                        <div
                                                            ref={
                                                                openMenuId === event.id
                                                                    ? menuRef
                                                                    : null
                                                            }
                                                            className="relative inline-block"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setOpenMenuId((prev) =>
                                                                        prev === event.id
                                                                            ? null
                                                                            : event.id
                                                                    )
                                                                }
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                                            >
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </button>

                                                            {openMenuId === event.id && (
                                                                <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openEditEvent(event)
                                                                        }
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                                                                    >
                                                                        <Edit3 className="h-4 w-4 text-sky-300" />
                                                                        Düzenle
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            event.status ===
                                                                            "CANCELLED"
                                                                        }
                                                                        onClick={() =>
                                                                            openCancelConfirm(
                                                                                event
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-amber-300 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        <Ban className="h-4 w-4" />
                                                                        Etkinliği İptal Et
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openDeleteConfirm(
                                                                                event
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Sil
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>

                    <aside className="h-fit rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(15,23,42,0.75)]">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-white">
                                Etkinlik Takvimi
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Etkinlik günlerini takvim üzerinde görüntüle.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-3 [&_.react-datepicker]:w-full [&_.react-datepicker]:!border-0 [&_.react-datepicker]:!bg-transparent [&_.react-datepicker__month-container]:w-full">
                            <DatePicker
                                selected={calendarDate}
                                onChange={handleCalendarDateChange}
                                minDate={todayDate}
                                locale="tr"
                                inline
                                renderDayContents={(day, date) => {
                                    const currentDate = date ? formatDateValue(date) : "";
                                    const hasEvent = eventDateSet.has(currentDate);

                                    return (
                                        <div className="relative flex h-full w-full items-center justify-center">
                                            <span>{day}</span>

                                            {hasEvent && (
                                                <span className="absolute bottom-0 h-1 w-1 rounded-full bg-sky-400" />
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Seçili Tarih
                            </p>

                            <p className="mt-1 text-lg font-black text-white">
                                {calendarDate.toLocaleDateString("tr-TR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Takvimde nokta olan günlerde etkinlik bulunuyor.
                            </p>
                        </div>
                    </aside>
                </div>

                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
                        onClick={closeModal}
                    >
                        <div
                            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-800/80 bg-slate-950 p-6 shadow-2xl staffly-scroll"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-white">
                                        {selectedEvent
                                            ? "Etkinlik Düzenle"
                                            : "Yeni Etkinlik Oluştur"}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Etkinlik bilgilerini ve tarih-saat aralığını belirle.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Başlık
                                    </label>

                                    <input
                                        className={modalInputClass}
                                        placeholder="Örn: Sprint Planlama Toplantısı"
                                        value={eventForm.title}
                                        onChange={(e) =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Etkinlik Türü
                                    </label>

                                    <select
                                        className={modalInputClass}
                                        value={eventForm.eventType}
                                        onChange={(e) =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                eventType: e.target.value as EventType,
                                            }))
                                        }
                                    >
                                        {eventTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {eventTypeLabels[type]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Başlangıç Tarihi
                                    </label>

                                    <DatePicker
                                        selected={eventForm.startDate}
                                        onChange={handleStartDateChange}
                                        minDate={todayDate}
                                        dateFormat="dd.MM.yyyy"
                                        className={modalInputClass}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Bitiş Tarihi
                                    </label>

                                    <DatePicker
                                        selected={eventForm.endDate}
                                        onChange={handleEndDateChange}
                                        minDate={eventForm.startDate}
                                        dateFormat="dd.MM.yyyy"
                                        className={modalInputClass}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Başlangıç Saati
                                    </label>

                                    <input
                                        className={modalInputClass}
                                        type="time"
                                        value={eventForm.startTime}
                                        onChange={(e) =>
                                            handleStartTimeChange(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Bitiş Saati
                                    </label>

                                    <input
                                        className={modalInputClass}
                                        type="time"
                                        value={eventForm.endTime}
                                        min={
                                            formatDateValue(eventForm.startDate) ===
                                            formatDateValue(eventForm.endDate)
                                                ? eventForm.startTime
                                                : undefined
                                        }
                                        onChange={(e) =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                endTime: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Konum
                                    </label>

                                    <input
                                        className={modalInputClass}
                                        placeholder="Örn: Toplantı Odası A"
                                        value={eventForm.location}
                                        onChange={(e) =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                location: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Online Toplantı Linki
                                    </label>

                                    <input
                                        className={modalInputClass}
                                        placeholder="Google Meet / Teams linki"
                                        value={eventForm.onlineMeetingUrl}
                                        onChange={(e) =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                onlineMeetingUrl: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Departman
                                    </label>

                                    <select
                                        className={modalInputClass}
                                        value={eventForm.departmentId}
                                        onChange={(e) =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                departmentId: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">Departman seç</option>
                                        {departments.map((department) => (
                                            <option
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-slate-400">
                                        Açıklama
                                    </label>

                                    <input
                                        className={modalInputClass}
                                        placeholder="Kısa açıklama"
                                        value={eventForm.description}
                                        onChange={(e) =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    className={secondaryButtonClass}
                                    onClick={closeModal}
                                    disabled={confirmModalLoading}
                                >
                                    Vazgeç
                                </button>

                                <button
                                    type="button"
                                    className={buttonClass}
                                    onClick={openSaveConfirm}
                                    disabled={confirmModalLoading}
                                >
                                    {selectedEvent
                                        ? "Etkinliği Güncelle"
                                        : "Etkinliği Oluştur"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={confirmModalOpen}
                    variant={confirmProps.variant}
                    title={confirmProps.title}
                    description={confirmProps.description}
                    detailText={confirmProps.detailText}
                    itemName={confirmProps.itemName}
                    confirmText={confirmProps.confirmText}
                    cancelText="Vazgeç"
                    isLoading={confirmModalLoading}
                    onClose={closeConfirmModal}
                    onConfirm={handleConfirmAction}
                />
            </div>
        </div>
    );
};

const StatCard = ({
                      icon,
                      iconClass,
                      title,
                      value,
                      subtitle,
                      subtitleClass,
                  }: {
    icon: JSX.Element;
    iconClass: string;
    title: string;
    value: number;
    subtitle: string;
    subtitleClass: string;
}) => {
    return (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
                >
                    {icon}
                </div>

                <div>
                    <p className="text-xs font-bold text-slate-300">
                        {title}
                    </p>

                    <p className="mt-1 text-3xl font-black text-white">
                        {value}
                    </p>

                    <p className={`text-xs font-semibold ${subtitleClass}`}>
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MeetingPlanningPage;