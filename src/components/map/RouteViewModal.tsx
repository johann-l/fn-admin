"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Stop } from "../routes/RouteFormModal";

const DefaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function RouteViewModal({
  route,
  onClose,
}: {
  route: { name: string; stops: Stop[] };
  onClose: () => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const routingRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const initialLatLng =
        route.stops.length > 0
          ? [route.stops[0].lat, route.stops[0].lng]
          : [12.91073112558288, 74.8986773];

      mapRef.current = L.map(containerRef.current).setView(initialLatLng, 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    // Add markers
    route.stops.forEach((stop) => {
      L.marker([stop.lat, stop.lng])
        .addTo(mapRef.current!)
        .bindPopup(stop.name);
    });

    // Draw route if more than one stop
    if (route.stops.length > 1) {
      const waypoints = route.stops.map((s) => L.latLng(s.lat, s.lng));
      try {
        // @ts-ignore
        routingRef.current = (L as any).Routing.control({
          waypoints,
          lineOptions: { styles: [{ color: "#3b8132", weight: 4 }] },
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          show: false,
          itinerary: false,
        }).addTo(mapRef.current);
      } catch {}
    }

    return () => {
      if (routingRef.current && mapRef.current?.hasLayer(routingRef.current)) {
        try {
          mapRef.current.removeControl(routingRef.current);
        } catch {}
        routingRef.current = null;
      }
    };
  }, [route]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-background rounded-lg shadow-lg w-[90%] h-[90%] flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="text-lg font-semibold">{route.name} - Route View</h3>
          <button onClick={onClose} className="text-red-500 font-bold">
            X
          </button>
        </div>
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
}
