"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

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

export type Stop = { name: string; lat: number; lng: number };

export default function MapPickerModal({
  stops = [],
  onSelect,
  onClose,
}: {
  stops?: Stop[];
  onSelect: (lat: number, lng: number, name: string) => void;
  onClose: () => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const routingRef = useRef<L.Control | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const initialLatLng =
        stops.length > 0
          ? [stops[stops.length - 1].lat, stops[stops.length - 1].lng]
          : [12.91073112558288, 74.8986773];

      mapRef.current = L.map(containerRef.current).setView(initialLatLng, 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    // Load existing stops
    const existingMarkers = stops.map((stop) =>
      L.marker([stop.lat, stop.lng]).addTo(mapRef.current!).bindPopup(stop.name)
    );
    setMarkers(existingMarkers);

    // Add new stop on click
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const name = prompt("Enter stop name:", `Stop ${markers.length + 1}`);
      if (!name) return;

      const marker = L.marker(e.latlng)
        .addTo(mapRef.current!)
        .bindPopup(name)
        .openPopup();

      setMarkers((prev) => [...prev, marker]);
      onSelect(e.latlng.lat, e.latlng.lng, name);
      mapRef.current!.setView(e.latlng, mapRef.current!.getZoom());
    };

    mapRef.current.on("click", handleMapClick);

    return () => {
      mapRef.current?.off("click", handleMapClick);
    };
  }, []);

  // Draw/update route
  useEffect(() => {
    if (!mapRef.current) return;

    if (routingRef.current) {
      try {
        mapRef.current.removeControl(routingRef.current);
      } catch {}
      routingRef.current = null;
    }

    if (markers.length > 1) {
      const waypoints = markers.map((m) => m.getLatLng());
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
    }
  }, [markers]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-background rounded-lg shadow-lg w-[90%] h-[90%] flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="text-lg font-semibold">Select Stop Location</h3>
          <button onClick={onClose} className="text-red-500 font-bold">
            X
          </button>
        </div>
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
}
