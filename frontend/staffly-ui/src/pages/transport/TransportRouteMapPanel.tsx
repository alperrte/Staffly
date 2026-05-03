import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { X, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import type { TransportRouteStop } from "../../services/transportService";

type Props = {
    open: boolean;
    loading: boolean;
    error: string;
    routeCode?: string;
    routeName?: string;
    stops: TransportRouteStop[];
    onClose: () => void;
};

const defaultCenter: [number, number] = [40.85, 29.37];

const markerIcon = L.icon({
    iconRetinaUrl: marker2x,
    iconUrl: marker,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function TransportRouteMapPanel({
    open,
    loading,
    error,
    routeCode,
    routeName,
    stops,
    onClose,
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layerGroupRef = useRef<L.LayerGroup | null>(null);
    const [routePath, setRoutePath] = useState<Array<[number, number]>>([]);
    const [routingLoading, setRoutingLoading] = useState(false);
    const [routingError, setRoutingError] = useState("");

    const points = stops.map((stop) => [stop.latitude, stop.longitude] as [number, number]);

    useEffect(() => {
        if (!open || loading || error || points.length === 0 || !mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: 11,
            zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);

        mapRef.current = map;
        layerGroupRef.current = layerGroup;
    }, [open, loading, error, points.length]);

    useEffect(() => {
        if (open) return;

        if (mapRef.current) {
            mapRef.current.remove();
        }
        mapRef.current = null;
        layerGroupRef.current = null;
    }, [open]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
            mapRef.current = null;
            layerGroupRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!open) return;

        const map = mapRef.current;
        if (!map) return;

        setTimeout(() => map.invalidateSize(), 120);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        if (points.length < 2) {
            setRoutePath(points);
            setRoutingError("");
            setRoutingLoading(false);
            return;
        }

        const controller = new AbortController();
        const fetchRoute = async () => {
            try {
                setRoutingLoading(true);
                setRoutingError("");

                const coordinates = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Routing request failed");
                }

                const data = await response.json();
                const geometry = data?.routes?.[0]?.geometry?.coordinates;

                if (!Array.isArray(geometry) || geometry.length === 0) {
                    throw new Error("No route geometry found");
                }

                const mappedPath = geometry
                    .map((item: unknown) => {
                        if (!Array.isArray(item) || item.length < 2) return null;
                        const lng = Number(item[0]);
                        const lat = Number(item[1]);
                        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
                        return [lat, lng] as [number, number];
                    })
                    .filter((point: [number, number] | null): point is [number, number] => point !== null);

                setRoutePath(mappedPath.length > 1 ? mappedPath : points);
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                console.error(err);
                setRoutePath(points);
                setRoutingError("Gerçek rota çizgisi alınamadı, düz çizgi gösteriliyor.");
            } finally {
                setRoutingLoading(false);
            }
        };

        fetchRoute();
        return () => controller.abort();
    }, [open, stops]);

    useEffect(() => {
        if (open) return;
        setRoutePath([]);
        setRoutingLoading(false);
        setRoutingError("");
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const map = mapRef.current;
        const layerGroup = layerGroupRef.current;
        if (!map || !layerGroup) return;

        layerGroup.clearLayers();

        points.forEach((point, index) => {
            const stop = stops[index];
            L.marker(point, { icon: markerIcon })
                .bindPopup(`<strong>${stop.stopOrder}. ${stop.stopName}</strong><br/>${point[0].toFixed(5)}, ${point[1].toFixed(5)}`)
                .addTo(layerGroup);
        });

        const pathToDraw = routePath.length > 1 ? routePath : points;
        if (pathToDraw.length > 1) {
            const routeLine = L.polyline(pathToDraw, {
                color: "#38bdf8",
                weight: 5,
                opacity: 0.95,
            }).addTo(layerGroup);
            map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
        } else if (points.length === 1) {
            map.setView(points[0], 13);
        } else {
            map.setView(defaultCenter, 11);
        }
    }, [open, routePath, stops]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9995] overflow-y-auto bg-black/75 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center px-3 py-8 sm:px-6">
                <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_70px_rgba(2,6,23,0.95)]">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Rota Haritası</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                {routeCode ? `${routeCode} - ${routeName || ""}` : "Seçili rota"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
                        <div className="h-[420px] bg-slate-900">
                            {error ? (
                                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-rose-300">
                                    {error}
                                </div>
                            ) : points.length === 0 && !loading ? (
                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                    Bu rota için durak koordinatı bulunamadı.
                                </div>
                            ) : (
                                <div className="relative h-full w-full">
                                    <div ref={mapContainerRef} className="h-full w-full" />
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/75 text-sm text-slate-300">
                                            Harita yukleniyor...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/10 bg-slate-950/80 p-5 lg:border-l lg:border-t-0">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                                <Navigation className="h-4 w-4 text-sky-300" />
                                Duraklar
                            </div>
                            <div className="space-y-2">
                                {routingLoading && (
                                    <p className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
                                        Yol servisi hesaplanıyor...
                                    </p>
                                )}
                                {routingError && (
                                    <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                        {routingError}
                                    </p>
                                )}
                                {stops.length === 0 ? (
                                    <p className="text-sm text-slate-500">Durak bilgisi yok.</p>
                                ) : (
                                    stops.map((stop) => {
                                        const externalMapUrl = `https://www.openstreetmap.org/?mlat=${stop.latitude}&mlon=${stop.longitude}#map=14/${stop.latitude}/${stop.longitude}`;

                                        return (
                                            <a
                                                key={`${stop.routeId}-${stop.stopOrder}-card`}
                                                href={externalMapUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 transition hover:border-sky-500/40"
                                            >
                                                <p className="text-sm font-medium text-white">
                                                    {stop.stopOrder}. {stop.stopName}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                                                </p>
                                            </a>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
