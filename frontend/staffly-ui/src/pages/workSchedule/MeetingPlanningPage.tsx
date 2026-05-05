import { useEffect, useMemo, useState } from "react";
import {
    addParticipants,
    cancelCalendarEvent,
    createCalendarEvent,
    getCalendarEvents,
    getDepartments,
    getEmployees,
    removeParticipant,
    updateCalendarEvent,
    type CalendarEventResponse,
    type DepartmentResponse,
    type EmployeeResponse,
    type EventType,
} from "../../services/workScheduleService";

const inputClass =
    "w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition [&>option]:bg-slate-950 [&>option]:text-slate-100";

const buttonClass =
    "rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-5 py-3 text-sm transition shadow-lg shadow-sky-500/20";

const secondaryButtonClass =
    "rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-5 py-3 text-sm transition";

const cardClass =
    "rounded-3xl border border-slate-800/80 bg-slate-950/70 shadow-[0_0_35px_rgba(15,23,42,0.75)] p-6";

const eventTypeLabels: Record<EventType, string> = {
    MEETING: "Toplantı",
    TRAINING: "Eğitim",
    INTERVIEW: "Mülakat",
    COMPANY_EVENT: "Şirket Etkinliği",
    OTHER: "Diğer",
};

const MeetingPlanningPage = () => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [events, setEvents] = useState<CalendarEventResponse[]>([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] =
        useState<CalendarEventResponse | null>(null);

    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const [filter, setFilter] = useState({
        startDate: today,
        endDate: today,
    });

    const [eventForm, setEventForm] = useState({
        title: "",
        description: "",
        eventType: "MEETING" as EventType,
        startDateTime: `${today}T09:00`,
        endDateTime: `${today}T10:00`,
        location: "",
        onlineMeetingUrl: "",
        departmentId: "",
        participantIds: [] as number[],
    });

    const eventTypes: EventType[] = [
        "MEETING",
        "TRAINING",
        "INTERVIEW",
        "COMPANY_EVENT",
        "OTHER",
    ];

    const showSuccess = (text: string) => {
        setMessage(text);
        setError("");
    };

    const showError = (err: any, fallback: string) => {
        setMessage("");
        setError(err?.response?.data?.message || fallback);
    };

    const loadEvents = async () => {
        try {
            const data = await getCalendarEvents(
                `${filter.startDate}T00:00:00`,
                `${filter.endDate}T23:59:59`
            );

            setEvents(data);
            setError("");
        } catch (err) {
            setError("Etkinlikler getirilemedi.");
        }
    };

    const loadInitialData = async () => {
        try {
            setError("");

            const [employeeData, departmentData] = await Promise.all([
                getEmployees(),
                getDepartments(),
            ]);

            setEmployees(employeeData);
            setDepartments(departmentData);

            await loadEvents();
        } catch (err) {
            setError("Veriler yüklenirken hata oluştu.");
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const resetForm = () => {
        setSelectedEvent(null);
        setEventForm({
            title: "",
            description: "",
            eventType: "MEETING",
            startDateTime: `${today}T09:00`,
            endDateTime: `${today}T10:00`,
            location: "",
            onlineMeetingUrl: "",
            departmentId: "",
            participantIds: [],
        });
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        resetForm();
        setIsModalOpen(false);
    };

    const toggleParticipant = (employeeId: number) => {
        setEventForm((prev) => {
            const exists = prev.participantIds.includes(employeeId);

            return {
                ...prev,
                participantIds: exists
                    ? prev.participantIds.filter((id) => id !== employeeId)
                    : [...prev.participantIds, employeeId],
            };
        });
    };

    const handleCreateOrUpdateEvent = async () => {
        try {
            const payload = {
                title: eventForm.title,
                description: eventForm.description,
                eventType: eventForm.eventType,
                startDateTime: eventForm.startDateTime,
                endDateTime: eventForm.endDateTime,
                location: eventForm.location,
                onlineMeetingUrl: eventForm.onlineMeetingUrl,
                departmentId: eventForm.departmentId
                    ? Number(eventForm.departmentId)
                    : null,
            };

            if (selectedEvent) {
                await updateCalendarEvent(selectedEvent.id, payload);

                const oldParticipantIds =
                    selectedEvent.participants?.map((p) => p.employeeId) ?? [];

                const newParticipantIds = eventForm.participantIds;

                const participantsToAdd = newParticipantIds.filter(
                    (id) => !oldParticipantIds.includes(id)
                );

                const participantsToRemove = oldParticipantIds.filter(
                    (id) => !newParticipantIds.includes(id)
                );

                if (participantsToAdd.length > 0) {
                    await addParticipants(selectedEvent.id, participantsToAdd);
                }

                for (const employeeId of participantsToRemove) {
                    await removeParticipant(selectedEvent.id, employeeId);
                }

                showSuccess("Etkinlik güncellendi.");
            } else {
                await createCalendarEvent({
                    ...payload,
                    participantIds: eventForm.participantIds,
                });

                showSuccess("Etkinlik oluşturuldu.");
            }

            closeModal();
            await loadEvents();
        } catch (err) {
            showError(err, "Etkinlik kaydedilemedi.");
        }
    };

    const handleEditEvent = (event: CalendarEventResponse) => {
        setSelectedEvent(event);

        setEventForm({
            title: event.title,
            description: event.description || "",
            eventType: event.eventType,
            startDateTime: event.startDateTime.slice(0, 16),
            endDateTime: event.endDateTime.slice(0, 16),
            location: event.location || "",
            onlineMeetingUrl: event.onlineMeetingUrl || "",
            departmentId: event.departmentId ? String(event.departmentId) : "",
            participantIds: event.participants?.map((p) => p.employeeId) ?? [],
        });

        setIsModalOpen(true);
    };

    const handleCancelEvent = async (id: number) => {
        try {
            await cancelCalendarEvent(id);
            showSuccess("Etkinlik iptal edildi.");
            await loadEvents();
        } catch (err) {
            showError(err, "Etkinlik iptal edilemedi.");
        }
    };

    const getDepartmentName = (departmentId: number | null) => {
        if (!departmentId) return "Departman yok";

        const department = departments.find((item) => item.id === departmentId);
        return department ? department.name : `Departman #${departmentId}`;
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-6 overflow-y-auto staffly-scroll">
            <div className="mb-6 flex flex-col gap-5">
                <div>
                    <p className="text-sm text-sky-400 font-semibold tracking-[0.25em] uppercase">
                        Calendar Event Service
                    </p>
                    <h1 className="text-3xl font-bold mt-2">
                        Toplantı & Etkinlik Yönetimi
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">
                        Toplantı, eğitim, mülakat ve şirket etkinliklerini oluştur,
                        katılımcıları belirle ve takvim kayıtlarını yönet.
                    </p>
                </div>

                <section className={cardClass}>
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                        <div>
                            <h2 className="text-xl font-semibold">
                                Etkinlikleri Listele
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Tarih aralığına göre toplantı ve etkinlikleri görüntüle.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full xl:w-auto">
                            <input
                                className={inputClass}
                                type="date"
                                value={filter.startDate}
                                onChange={(e) =>
                                    setFilter({
                                        ...filter,
                                        startDate: e.target.value,
                                    })
                                }
                            />

                            <input
                                className={inputClass}
                                type="date"
                                value={filter.endDate}
                                onChange={(e) =>
                                    setFilter({
                                        ...filter,
                                        endDate: e.target.value,
                                    })
                                }
                            />

                            <button className={buttonClass} onClick={loadEvents}>
                                Listele
                            </button>
                        </div>

                        <button className={buttonClass} onClick={openCreateModal}>
                            + Yeni Etkinlik / Toplantı Oluştur
                        </button>
                    </div>
                </section>
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

            <section className={cardClass}>
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">Etkinlikler</h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Oluşturulan etkinlikleri düzenle veya iptal et.
                        </p>
                    </div>

                    <span className="rounded-full bg-slate-900 border border-slate-800 px-4 py-2 text-sm text-slate-300">
                        Toplam: {events.length}
                    </span>
                </div>

                {events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
                        <p className="text-slate-300 font-semibold">
                            Etkinlik bulunamadı.
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                            Yeni etkinlik oluşturabilir veya tarih filtresini değiştirebilirsin.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-sky-500/40 transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {event.title}
                                        </h3>

                                        <p className="text-xs mt-2 inline-flex rounded-full bg-sky-500/10 text-sky-300 px-3 py-1">
                                            {eventTypeLabels[event.eventType]}
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            event.status === "ACTIVE"
                                                ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                                                : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300"
                                        }
                                    >
                                        {event.status === "ACTIVE" ? "Aktif" : "İptal"}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-slate-400">
                                    <p>
                                        Tarih:{" "}
                                        <span className="text-slate-200">
                                            {event.startDateTime.slice(0, 10)}
                                        </span>
                                    </p>

                                    <p>
                                        Saat:{" "}
                                        <span className="text-slate-200">
                                            {event.startDateTime.slice(11, 16)} -{" "}
                                            {event.endDateTime.slice(11, 16)}
                                        </span>
                                    </p>

                                    <p>
                                        Departman:{" "}
                                        <span className="text-slate-200">
                                            {getDepartmentName(event.departmentId)}
                                        </span>
                                    </p>

                                    {event.location && (
                                        <p>
                                            Konum:{" "}
                                            <span className="text-slate-200">
                                                {event.location}
                                            </span>
                                        </p>
                                    )}

                                    {event.onlineMeetingUrl && (
                                        <p className="break-all">
                                            Link:{" "}
                                            <span className="text-sky-300">
                                                {event.onlineMeetingUrl}
                                            </span>
                                        </p>
                                    )}

                                    <p>
                                        Katılımcı:{" "}
                                        <span className="text-slate-200">
                                            {event.participants?.length ?? 0}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex gap-2 mt-5">
                                    <button
                                        className="rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-semibold"
                                        onClick={() => handleEditEvent(event)}
                                    >
                                        Düzenle
                                    </button>

                                    {event.status !== "CANCELLED" && (
                                        <button
                                            className="rounded-xl bg-red-500 hover:bg-red-400 px-4 py-2 text-xs font-semibold text-white"
                                            onClick={() => handleCancelEvent(event.id)}
                                        >
                                            İptal
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto staffly-scroll rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {selectedEvent
                                        ? "Etkinlik Düzenle"
                                        : "Yeni Etkinlik Oluştur"}
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Etkinlik bilgilerini, tarih-saat aralığını ve katılımcıları belirle.
                                </p>
                            </div>

                            <button
                                className={secondaryButtonClass}
                                onClick={closeModal}
                            >
                                Kapat
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Başlık
                                </label>
                                <input
                                    className={inputClass}
                                    placeholder="Örn: Sprint Planlama Toplantısı"
                                    value={eventForm.title}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Etkinlik Türü
                                </label>
                                <select
                                    className={inputClass}
                                    value={eventForm.eventType}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
                                            eventType: e.target.value as EventType,
                                        })
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
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Başlangıç Tarih/Saat
                                </label>
                                <input
                                    className={inputClass}
                                    type="datetime-local"
                                    value={eventForm.startDateTime}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
                                            startDateTime: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Bitiş Tarih/Saat
                                </label>
                                <input
                                    className={inputClass}
                                    type="datetime-local"
                                    value={eventForm.endDateTime}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
                                            endDateTime: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Konum
                                </label>
                                <input
                                    className={inputClass}
                                    placeholder="Örn: Toplantı Odası A"
                                    value={eventForm.location}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
                                            location: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Online Toplantı Linki
                                </label>
                                <input
                                    className={inputClass}
                                    placeholder="Google Meet / Teams linki"
                                    value={eventForm.onlineMeetingUrl}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
                                            onlineMeetingUrl: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Departman
                                </label>
                                <select
                                    className={inputClass}
                                    value={eventForm.departmentId}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
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
                                    Açıklama
                                </label>
                                <input
                                    className={inputClass}
                                    placeholder="Kısa açıklama"
                                    value={eventForm.description}
                                    onChange={(e) =>
                                        setEventForm({
                                            ...eventForm,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-300">
                                        Katılımcılar
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Etkinliğe katılacak çalışanları seç.
                                    </p>
                                </div>

                                <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-300">
                                    Seçili: {eventForm.participantIds.length}
                                </span>
                            </div>

                            <div className="max-h-56 overflow-y-auto staffly-scroll grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pr-2">
                                {employees.map((employee) => (
                                    <label
                                        key={employee.id}
                                        className="flex items-center gap-3 text-sm text-slate-300 bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2 hover:border-sky-500/40 transition cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={eventForm.participantIds.includes(employee.id)}
                                            onChange={() => toggleParticipant(employee.id)}
                                        />

                                        <span>
                                            {employee.firstName} {employee.lastName}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button className={secondaryButtonClass} onClick={closeModal}>
                                Vazgeç
                            </button>

                            <button
                                className={buttonClass}
                                onClick={handleCreateOrUpdateEvent}
                            >
                                {selectedEvent ? "Etkinliği Güncelle" : "Etkinliği Oluştur"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingPlanningPage;