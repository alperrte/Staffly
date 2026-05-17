import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import {
    BusFront,
    CheckCircle2,
    HelpCircle,
    Map,
    Plus,
    Route,
    Search,
    X,
} from "lucide-react";
import { getCurrentUser } from "../../services/userService";
import { getEmployeeById } from "../../services/employeeService";
import {
    approveTransportRequest,
    createTransportRoute,
    createTransportRequest,
    getActiveTransportRoutes,
    getPendingTransportRequests,
    getTransportRouteStops,
    getTransportRequestsByEmployee,
    rejectTransportRequest,
    type TransportRequest,
    type TransportRoute,
    type TransportRouteStop,
} from "../../services/transportService";
import TransportRouteMapPanel from "./TransportRouteMapPanel";
import {
    hasAnyRole,
    ROLE_HR_MANAGER,
    ROLE_SYSTEM_ADMIN,
} from "../../utils/auth";
import TransportRoutePickerMap, { type RoutePoint } from "./TransportRoutePickerMap";

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
    preferredRouteId: "",
    note: "",
};

const emptyRouteForm = {
    routeName: "",
    description: "",
    capacity: "",
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
    const [pendingRequests, setPendingRequests] = useState<TransportRequest[]>([]);
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
    const [routeFormOpen, setRouteFormOpen] = useState(false);
    const [routeForm, setRouteForm] = useState(emptyRouteForm);
    const [routeSaving, setRouteSaving] = useState(false);
    const [routeOrigin, setRouteOrigin] = useState<RoutePoint | null>(null);
    const [routeDestination, setRouteDestination] = useState<RoutePoint | null>(null);
    const [routePointLoading, setRoutePointLoading] = useState(false);
    const [howItWorksOpen, setHowItWorksOpen] = useState(false);
    const [reviewingRequestId, setReviewingRequestId] = useState<number | null>(null);

    const canManageRoutes = hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]);
    const canReviewRequests = hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const user = await getCurrentUser();
            const activeRoutesPromise = getActiveTransportRoutes();
            const pendingRequestsPromise = canReviewRequests
                ? getPendingTransportRequests()
                : Promise.resolve([]);

            if (!user.employeeId) {
                setCurrentEmployee(null);
                const [activeRoutes, reviewQueue] = await Promise.all([
                    activeRoutesPromise,
                    pendingRequestsPromise,
                ]);
                setRoutes(activeRoutes);
                setPendingRequests(reviewQueue);
                return;
            }

            const [employee, activeRoutes, employeeRequests, reviewQueue] = await Promise.all([
                getEmployeeById(user.employeeId).catch(() => null),
                activeRoutesPromise,
                getTransportRequestsByEmployee(user.employeeId),
                pendingRequestsPromise,
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
            setPendingRequests(reviewQueue);
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

    const visibleRequests = requests;

    const openRequestForm = (route: TransportRoute) => {
        setSelectedRoute(route);
        setForm((prev) => ({
            ...prev,
            preferredRouteId: String(route.id),
        }));
        setFormOpen(true);
    };

    const openBlankRequestForm = () => {
        const firstRoute = routes[0] ?? null;

        setSelectedRoute(firstRoute);
        setForm((prev) => ({
            ...prev,
            preferredRouteId: firstRoute ? String(firstRoute.id) : "",
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

    const closeRouteForm = () => {
        setRouteFormOpen(false);
        setRouteForm(emptyRouteForm);
        setRouteOrigin(null);
        setRouteDestination(null);
    };

    const routeCode = useMemo(() => {
        if (!routeOrigin || !routeDestination) return "";

        const initials = (value: string) =>
            value
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((item) => item.charAt(0))
                .join("")
                .toUpperCase();

        const nextIndex = String(routes.length + 1).padStart(2, "0");

        return `${initials(routeOrigin.label) || "OR"}${initials(routeDestination.label) || "DS"}-${nextIndex}`;
    }, [routeDestination, routeOrigin, routes.length]);

    const serviceAreas = useMemo(
        () =>
            [routeOrigin?.label, routeDestination?.label].filter(
                (value): value is string => Boolean(value)
            ),
        [routeDestination?.label, routeOrigin?.label]
    );

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

        const route = routes.find((item) => item.id === Number(form.preferredRouteId));

        const employeeName =
            [currentEmployee.firstName, currentEmployee.lastName].filter(Boolean).join(" ").trim() ||
            currentEmployee.email ||
            `Employee ${currentEmployee.id}`;

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

    const handleRouteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const capacity = Number(routeForm.capacity);

        if (
            !routeForm.routeName.trim() ||
            !routeCode ||
            !routeOrigin ||
            !routeDestination ||
            serviceAreas.length === 0 ||
            !Number.isFinite(capacity) ||
            capacity < 1
        ) {
            setError("Rota kodu, adı, başlangıç, varış, kapsam ve kapasite alanlarını doldurun.");
            return;
        }

        try {
            setRouteSaving(true);
            setError("");

            await createTransportRoute({
                routeCode,
                routeName: routeForm.routeName.trim(),
                description: routeForm.description.trim() || undefined,
                originArea: routeOrigin.label,
                destinationArea: routeDestination.label,
                serviceAreas,
                capacity,
                active: true,
            });

            closeRouteForm();
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Servis rotası oluşturulamadı.");
        } finally {
            setRouteSaving(false);
        }
    };

    const reverseGeocode = async (point: { lat: number; lng: number }) => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}`
        );

        if (!response.ok) {
            throw new Error("Reverse geocoding failed");
        }

        const data = await response.json();
        const address = data?.address ?? {};

        return (
            address.suburb ||
            address.town ||
            address.city_district ||
            address.city ||
            address.village ||
            data?.name ||
            `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
        );
    };

    const handleRoutePointPick = async (point: { lat: number; lng: number }) => {
        try {
            setRoutePointLoading(true);
            setError("");

            const label = await reverseGeocode(point);
            const pickedPoint = { ...point, label };

            if (!routeOrigin || routeDestination) {
                setRouteOrigin(pickedPoint);
                setRouteDestination(null);
            } else {
                setRouteDestination(pickedPoint);
            }
        } catch (err) {
            console.error(err);
            setError("Seçilen noktanın bölge bilgisi alınamadı.");
        } finally {
            setRoutePointLoading(false);
        }
    };

    const reviewRequest = async (requestId: number, approve: boolean) => {
        try {
            setReviewingRequestId(requestId);
            setError("");

            if (approve) {
                await approveTransportRequest(requestId);
            } else {
                await rejectTransportRequest(requestId);
            }

            await loadData();
        } catch (err) {
            console.error(err);
            setError(approve ? "Servis talebi onaylanamadı." : "Servis talebi reddedilemedi.");
        } finally {
            setReviewingRequestId(null);
        }
    };

    const howItWorksModal =
        howItWorksOpen &&
        createPortal(
            <div
                className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
                onClick={() => setHowItWorksOpen(false)}
            >
                <div
                    className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_70px_rgba(2,6,23,0.95)]"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/15 text-sky-300">
                                <HelpCircle className="h-6 w-6" />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white">Nasıl çalışır?</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Servis talebi oluşturma akışı.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setHowItWorksOpen(false)}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-3 px-6 py-6 text-sm text-slate-300">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <span className="font-semibold text-white">1.</span> Servis havuzunda aktif bir hat seçilir.
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <span className="font-semibold text-white">2.</span> Aktif rotalardan uygun hat seçilir.
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <span className="font-semibold text-white">3.</span> Uygunluk kontrolünden sonra talep beklemeye alınır.
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );

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

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-400">
                                    Seçilen Rota
                                </label>

                                <select
                                    value={form.preferredRouteId}
                                    onChange={(e) => {
                                        const preferredRouteId = e.target.value;

                                        setForm((prev) => ({ ...prev, preferredRouteId }));

                                        setSelectedRoute(
                                            routes.find((route) => route.id === Number(preferredRouteId)) ?? null
                                        );
                                    }}
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
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            note: e.target.value,
                                        }))
                                    }
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

    const routeModal =
        routeFormOpen &&
        createPortal(
            <div className="fixed inset-0 z-[9990] overflow-y-auto bg-black/80 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center px-3 py-8 sm:px-6 sm:py-10">
                    <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_60px_rgba(2,6,23,0.9)]">
                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Yeni Servis Rotası</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Aktif rotalar havuzuna yeni bir hat ekleyin.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRouteForm}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRouteSubmit} className="space-y-4 px-5 py-5 sm:px-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white">
                                    <div className="text-xs text-slate-500">Otomatik rota kodu</div>
                                    <div className="mt-1 font-semibold">
                                        {routeCode || "Nokta seçildikten sonra oluşur"}
                                    </div>
                                </div>

                                <input
                                    value={routeForm.routeName}
                                    onChange={(e) =>
                                        setRouteForm((prev) => ({
                                            ...prev,
                                            routeName: e.target.value,
                                        }))
                                    }
                                    placeholder="Rota adı"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                />
                            </div>

                            <textarea
                                value={routeForm.description}
                                onChange={(e) =>
                                    setRouteForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                rows={3}
                                placeholder="Açıklama"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                            />

                            <div className="space-y-3">
                                <TransportRoutePickerMap
                                    origin={routeOrigin}
                                    destination={routeDestination}
                                    onPick={handleRoutePointPick}
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white">
                                        <div className="text-xs text-slate-500">Başlangıç</div>
                                        <div className="mt-1 font-semibold">
                                            {routeOrigin?.label || "Haritadan seçin"}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white">
                                        <div className="text-xs text-slate-500">Varış</div>
                                        <div className="mt-1 font-semibold">
                                            {routeDestination?.label || "Haritadan seçin"}
                                        </div>
                                    </div>
                                </div>

                                {routePointLoading && (
                                    <p className="text-xs text-sky-200">Bölge bilgisi alınıyor...</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                                <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white">
                                    <div className="text-xs text-slate-500">Otomatik kapsam bölgeleri</div>
                                    <div className="mt-1 font-semibold">
                                        {serviceAreas.length
                                            ? serviceAreas.join(" • ")
                                            : "Başlangıç ve varış seçilince oluşur"}
                                    </div>
                                </div>

                                <input
                                    value={routeForm.capacity}
                                    onChange={(e) =>
                                        setRouteForm((prev) => ({
                                            ...prev,
                                            capacity: e.target.value,
                                        }))
                                    }
                                    type="number"
                                    min="1"
                                    placeholder="Kapasite"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-3 border-t border-white/10 pt-4">
                                <button
                                    type="button"
                                    onClick={closeRouteForm}
                                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Vazgeç
                                </button>

                                <button
                                    type="submit"
                                    disabled={routeSaving}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:opacity-90 disabled:opacity-60"
                                >
                                    {routeSaving ? "Kaydediliyor..." : "Rotayı Oluştur"}
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
            {howItWorksModal}
            {requestModal}
            {routeModal}

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

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setHowItWorksOpen(true)}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-200"
                            title="Nasıl çalışır?"
                        >
                            <HelpCircle className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={openBlankRequestForm}
                            className="inline-flex items-center gap-2 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-400/60 hover:bg-sky-500/15"
                        >
                            <Plus className="h-4 w-4" />
                            Yeni servis talebi
                        </button>

                        {canManageRoutes && (
                            <button
                                type="button"
                                onClick={() => setRouteFormOpen(true)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                                <Plus className="h-4 w-4" />
                                Yeni servis rotası
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
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
                        <p className="mt-2 text-2xl font-bold text-white">{visibleRequests.length}</p>
                        <p className="mt-2 text-xs text-slate-400">Sistemdeki servis başvuruların</p>
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
                <div className="space-y-5">
                    {canReviewRequests && (
                        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-amber-950/20 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Servis Talebi Onayları</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Bekleyen aktif servis taleplerini inceleyip sonuçlandır.
                                    </p>
                                </div>

                                <div className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                                    {pendingRequests.length} bekleyen
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {pendingRequests.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
                                        Bekleyen servis talebi yok.
                                    </div>
                                ) : (
                                    pendingRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        {request.employeeName}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-300">
                                                        {request.preferredRouteCode || "Rota"} -{" "}
                                                        {request.preferredRouteName || "Servis Rotası"}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Oluşturulma: {formatDateTR(request.createdAt)}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => reviewRequest(request.id, false)}
                                                        disabled={reviewingRequestId === request.id}
                                                        className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
                                                    >
                                                        Reddet
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => reviewRequest(request.id, true)}
                                                        disabled={reviewingRequestId === request.id}
                                                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                                                    >
                                                        Onayla
                                                    </button>
                                                </div>
                                            </div>

                                            {request.note && (
                                                <p className="mt-3 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-slate-300">
                                                    {request.note}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

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

                        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            {filteredRoutes.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-400 md:col-span-2 2xl:col-span-3">
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

                                        <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                                            <span>Kapasite: {route.capacity}</span>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openMapPanel(route)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25"
                                                >
                                                    <Map className="h-3.5 w-3.5" />
                                                    Gerçek Rotayı Haritada Gör
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
                                <h2 className="text-lg font-semibold text-white">Servis Taleplerim</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Talep durumunu takip et.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {visibleRequests.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
                                    Henüz servis talebin yok.
                                </div>
                            ) : (
                                visibleRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {request.preferredRouteCode || "Rota"} -{" "}
                                                    {request.preferredRouteName || "Servis Rotası"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {request.preferredRouteCode || "Rota seçimi"}
                                                </p>

                                                <p className="mt-2 text-xs text-slate-500">
                                                    Oluşturulma: {formatDateTR(request.createdAt)}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    statusClass[request.status] || statusClass.PENDING
                                                }`}
                                            >
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
            )}
        </div>
    );
}
