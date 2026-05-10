import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { BusFront, CheckCircle2, Map, MapPin, Plus, Route, Search, X } from "lucide-react";
import { getCurrentUser } from "../../services/userService";
import { getEmployeeById } from "../../services/employeeService";
import {
    createTransportRequest,
    getActiveTransportRoutes,
    getTransportRouteStops,
    getTransportRequestsByEmployee,
    type TransportRequest,
    type TransportRoute,
    type TransportRouteStop,
} from "../../services/transportService";
import TransportRouteMapPanel from "./TransportRouteMapPanel";

type EmployeeProfile = {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    departmentName?: string;
    positionName?: string;
    status?: string;
};

const emptyForm = {
    employeeDistrict: "",
    employeeNeighborhood: "",
    preferredRouteId: "",
    note: "",
};

const statusLabelTR: Record<string, string> = {
    PENDING: "Beklemede",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
    CANCELLED: "İptal",
};

const statusClass: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    APPROVED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    REJECTED: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    CANCELLED: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
};

const formatDateTR = (value?: string) => {
    if (!value) return "-";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("tr-TR");
};

const routeAreaPreview = (route: TransportRoute) => {
    if (!route.serviceAreas?.length) return route.originArea;
    return route.serviceAreas.slice(0, 3).join(" • ");
};

export default function TransportPage() {
    const [routes, setRoutes] = useState<TransportRoute[]>([]);
    const [requests, setRequests] = useState<TransportRequest[]>([]);
    const [currentEmployee, setCurrentEmployee] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [mapOpen, setMapOpen] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [mapError, setMapError] = useState("");
    const [mapRoute, setMapRoute] = useState<TransportRoute | null>(null);
    const [mapStops, setMapStops] = useState<TransportRouteStop[]>([]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const user = await getCurrentUser();
            if (!user.employeeId) {
                setCurrentEmployee(null);
                setRoutes(await getActiveTransportRoutes());
                return;
            }

            const [employee, activeRoutes, employeeRequests] = await Promise.all([
                getEmployeeById(user.employeeId).catch(() => null),
                getActiveTransportRoutes(),
                getTransportRequestsByEmployee(user.employeeId),
            ]);

            setCurrentEmployee(
                employee
                    ? {
                          id: employee.id,
                          firstName: employee.firstName,
                          lastName: employee.lastName,
                          email: employee.email,
                                                    departmentName: employee.departmentName ?? undefined,
                                                    positionName: employee.positionName ?? undefined,
                          status: employee.status,
                      }
                    : { id: user.employeeId }
            );
            setRoutes(activeRoutes);
            setRequests(employeeRequests);
        } catch (err) {
            console.error(err);
            setError("Servis rotaları yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredRoutes = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return routes;

        return routes.filter((route) => {
            const searchable = [
                route.routeCode,
                route.routeName,
                route.originArea,
                route.destinationArea,
                route.serviceAreas.join(" "),
                route.description ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(q);
        });
    }, [routes, search]);

    const openRequestForm = (route: TransportRoute) => {
        setSelectedRoute(route);
        setForm((prev) => ({
            ...prev,
            preferredRouteId: String(route.id),
        }));
        setFormOpen(true);
    };

    const closeRequestForm = () => {
        setFormOpen(false);
        setSelectedRoute(null);
        setForm(emptyForm);
    };

    const closeMapPanel = () => {
        setMapOpen(false);
        setMapError("");
        setMapLoading(false);
        setMapRoute(null);
        setMapStops([]);
    };

    const openMapPanel = async (route: TransportRoute) => {
        try {
            setMapRoute(route);
            setMapOpen(true);
            setMapLoading(true);
            setMapError("");

            const stops = await getTransportRouteStops(route.id);
            setMapStops(stops);
        } catch (err) {
            console.error(err);
            setMapStops([]);
            setMapError("Rota durakları yüklenemedi.");
        } finally {
            setMapLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!currentEmployee?.id) {
            setError("Çalışan bilgisi bulunamadı.");
            return;
        }

        if (!form.preferredRouteId) {
            setError("Servis rotası seçmelisiniz.");
            return;
        }

        if (!form.employeeDistrict.trim()) {
            setError("İlçe zorunludur.");
            return;
        }

        const route = routes.find((item) => item.id === Number(form.preferredRouteId));
        const employeeName = [currentEmployee.firstName, currentEmployee.lastName].filter(Boolean).join(" ").trim() || currentEmployee.email || `Employee ${currentEmployee.id}`;

        if (!route) {
            setError("Seçili rota bulunamadı.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await createTransportRequest({
                employeeId: currentEmployee.id,
                employeeName,
                employeeDistrict: form.employeeDistrict.trim(),
                employeeNeighborhood: form.employeeNeighborhood.trim(),
                preferredRouteId: route.id,
                note: form.note.trim(),
            });

            closeRequestForm();
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Servis talebi oluşturulamadı.");
        } finally {
            setSaving(false);
        }
    };

    const requestModal =
        formOpen &&
        createPortal(
            <div className="fixed inset-0 z-[9990] overflow-y-auto bg-black/80 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center px-3 py-8 sm:px-6 sm:py-10">
                    <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_60px_rgba(2,6,23,0.9)]">
                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Servis Talebi Oluştur</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Havuzdaki uygun rotalardan birini seçerek başvuru yapın.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeRequestForm}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
                            {selectedRoute && (
                                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sky-200">
                                        <Route className="h-4 w-4" />
                                        Seçili Hat
                                    </div>
                                    <p className="mt-2 text-base font-semibold text-white">
                                        {selectedRoute.routeCode} - {selectedRoute.routeName}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-300">
                                        {selectedRoute.originArea} → {selectedRoute.destinationArea}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Çalışan
                                    </label>
                                    <input
                                        value={
                                            [currentEmployee?.firstName, currentEmployee?.lastName]
                                                .filter(Boolean)
                                                .join(" ") || currentEmployee?.email || `Employee ${currentEmployee?.id ?? "-"}`
                                        }
                                        disabled
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white opacity-80"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Çalışan ID
                                    </label>
                                    <input
                                        value={currentEmployee?.id ?? "-"}
                                        disabled
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white opacity-80"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        İlçe
                                    </label>
                                    <input
                                        value={form.employeeDistrict}
                                        onChange={(e) => setForm((prev) => ({ ...prev, employeeDistrict: e.target.value }))}
                                        placeholder="Gebze"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Mahalle / Bölge
                                    </label>
                                    <input
                                        value={form.employeeNeighborhood}
                                        onChange={(e) => setForm((prev) => ({ ...prev, employeeNeighborhood: e.target.value }))}
                                        placeholder="Darıca / Şekerpınar"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-400">
                                    Seçilen Rota
                                </label>
                                <select
                                    value={form.preferredRouteId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, preferredRouteId: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                                >
                                    <option value="">Rota seçin</option>
                                    {routes.map((route) => (
                                        <option key={route.id} value={route.id}>
                                            {route.routeCode} - {route.routeName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-400">
                                    Not
                                </label>
                                <textarea
                                    value={form.note}
                                    onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                                    rows={4}
                                    placeholder="Özel durum, vardiya bilgisi veya ek not..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-3 border-t border-white/10 pt-4">
                                <button
                                    type="button"
                                    onClick={closeRequestForm}
                                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    {saving ? "Gönderiliyor..." : "Talep Oluştur"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>,
            document.body
        );

    return (
        <div className="w-full px-3 py-1 sm:px-6">
            {requestModal}
            <TransportRouteMapPanel
                open={mapOpen}
                loading={mapLoading}
                error={mapError}
                routeCode={mapRoute?.routeCode}
                routeName={mapRoute?.routeName}
                stops={mapStops}
                onClose={closeMapPanel}
            />

            <div className="mb-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                            Ulaşım / Servis
                        </h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Servis havuzundaki uygun rotaları gör, uygun olan için talep oluştur.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-4">
                        <div className="flex items-center gap-2 text-sm text-sky-200">
                            <BusFront className="h-4 w-4" />
                            Aktif Hatlar
                        </div>
                        <p className="mt-2 text-2xl font-bold text-white">{routes.length}</p>
                        <p className="mt-2 text-xs text-slate-400">Yayınlanan servis rotaları</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                        <div className="flex items-center gap-2 text-sm text-emerald-200">
                            <CheckCircle2 className="h-4 w-4" />
                            Taleplerim
                        </div>
                        <p className="mt-2 text-2xl font-bold text-white">{requests.length}</p>
                        <p className="mt-2 text-xs text-slate-400">Sistemdeki servis başvuruların</p>
                    </div>
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
                        <div className="flex items-center gap-2 text-sm text-amber-200">
                            <MapPin className="h-4 w-4" />
                            Kullanıcı
                        </div>
                        <p className="mt-2 text-2xl font-bold text-white">
                            {currentEmployee?.id ?? "-"}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                            {[currentEmployee?.firstName, currentEmployee?.lastName].filter(Boolean).join(" ") || currentEmployee?.email || "Profil bulunamadı"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        {error}
                    </div>
                )}

                <div className="relative mt-5">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rota kodu, hat adı veya bölge ile ara..."
                        className="h-[56px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                </div>
            </div>

            {loading ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-10 text-center text-sm text-slate-400">
                    Servis verileri yükleniyor...
                </div>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-5">
                        <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-slate-900/40 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Uygun Hatlar</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Servis havuzundaki aktif ve talep edilebilir hatlar.
                                    </p>
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                    {filteredRoutes.length} rota
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {filteredRoutes.length === 0 ? (
                                    <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
                                        Uygun rota bulunamadı.
                                    </div>
                                ) : (
                                    filteredRoutes.map((route) => (
                                        <div
                                            key={route.id}
                                            className="group rounded-3xl border border-slate-800/90 bg-slate-950/70 p-5 transition hover:border-sky-500/35 hover:shadow-[0_24px_60px_rgba(56,189,248,0.12)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sky-300/90">
                                                        <Route className="h-4 w-4" />
                                                        {route.routeCode}
                                                    </div>
                                                    <h3 className="mt-2 text-lg font-semibold text-white">
                                                        {route.routeName}
                                                    </h3>
                                                </div>
                                                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                                                    Aktif
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                                {route.description || "Bu hat için açıklama henüz eklenmemiş."}
                                            </p>

                                            <div className="mt-4 grid gap-3 text-sm text-slate-300">
                                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                                    <p className="text-xs text-slate-500">Güzergah</p>
                                                    <p className="mt-1 text-white">
                                                        {route.originArea} → {route.destinationArea}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                                    <p className="text-xs text-slate-500">Kapsam</p>
                                                    <p className="mt-1 text-white">{routeAreaPreview(route)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                                                <span>Kapasite: {route.capacity}</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openMapPanel(route)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25"
                                                    >
                                                        <Map className="h-3.5 w-3.5" />
                                                        Gercek Rotayi Haritada Gor
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openRequestForm(route)}
                                                        className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20"
                                                    >
                                                        Talep oluştur
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-slate-900/40 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Son Taleplerim</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Talep durumunu takip et.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {requests.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
                                        Henüz servis talebin yok.
                                    </div>
                                ) : (
                                    requests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        {request.preferredRouteCode || "Rota"} - {request.preferredRouteName || "Servis Rotası"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {request.employeeDistrict}
                                                        {request.employeeNeighborhood ? ` / ${request.employeeNeighborhood}` : ""}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Oluşturulma: {formatDateTR(request.createdAt)}
                                                    </p>
                                                </div>
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass[request.status] || statusClass.PENDING}`}>
                                                    {statusLabelTR[request.status] || request.status}
                                                </span>
                                            </div>
                                            {request.note && (
                                                <p className="mt-3 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-slate-300">
                                                    {request.note}
                                                </p>
                                            )}
                                            {request.reviewNote && (
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Not: {request.reviewNote}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-slate-900/40 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
                            <h2 className="text-lg font-semibold text-white">Nasıl çalışır?</h2>
                            <div className="mt-4 space-y-3 text-sm text-slate-300">
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                                    1. Servis havuzunda aktif bir hat seçilir.
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                                    2. Çalışanın ilçe ve mahalle bilgisi girilir.
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                                    3. Uygunluk kontrolünden sonra talep beklemeye alınır.
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setFormOpen(true)}
                            className="w-full rounded-3xl border border-sky-500/30 bg-sky-500/10 p-6 text-left transition hover:border-sky-400/60 hover:bg-sky-500/15"
                        >
                            <div className="flex items-center gap-3 text-sky-200">
                                <Plus className="h-5 w-5" />
                                Yeni servis talebi
                            </div>
                            <p className="mt-2 text-sm text-slate-400">
                                Bir çalışan için yeni ulaşım talebi oluştur.
                            </p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}