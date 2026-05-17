import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

export type RoutePoint = {
    lat: number;
    lng: number;
    label: string;
};

type Props = {
    origin: RoutePoint | null;
    destination: RoutePoint | null;
    onPick: (point: { lat: number; lng: number }) => void;
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

export default function TransportRoutePickerMap({ origin, destination, onPick }: Props) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layerGroupRef = useRef<L.LayerGroup | null>(null);
    const onPickRef = useRef(onPick);

    useEffect(() => {
        onPickRef.current = onPick;
    }, [onPick]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

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

        map.on("click", (event) => {
            onPickRef.current({
                lat: event.latlng.lat,
                lng: event.latlng.lng,
            });
        });

        mapRef.current = map;
        layerGroupRef.current = layerGroup;

        return () => {
            map.remove();
            mapRef.current = null;
            layerGroupRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const layerGroup = layerGroupRef.current;
        if (!map || !layerGroup) return;

        layerGroup.clearLayers();

        const points = [origin, destination].filter((point): point is RoutePoint => point != null);

        points.forEach((point, index) => {
            L.marker([point.lat, point.lng], { icon: markerIcon })
                .bindPopup(`<strong>${index === 0 ? "Başlangıç" : "Varış"}</strong><br/>${point.label}`)
                .addTo(layerGroup);
        });

        if (origin && destination) {
            const routeLine = L.polyline(
                [
                    [origin.lat, origin.lng],
                    [destination.lat, destination.lng],
                ],
                {
                    color: "#38bdf8",
                    weight: 5,
                    opacity: 0.95,
                }
            ).addTo(layerGroup);

            map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
        } else if (origin) {
            map.setView([origin.lat, origin.lng], 13);
        } else {
            map.setView(defaultCenter, 11);
        }
    }, [destination, origin]);

    return <div ref={mapContainerRef} className="h-[320px] w-full rounded-2xl" />;
}
