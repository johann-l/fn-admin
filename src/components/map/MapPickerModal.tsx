"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.remove();
    }

    if (containerRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [12.91073112558288, 74.8986773],
        16
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      let marker: L.Marker | null = null;

      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        if (marker) marker.remove();
        marker = L.marker(e.latlng).addTo(mapRef.current!);
        onSelect(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-background rounded-lg shadow-lg w-[80%] h-[70%] flex flex-col">
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
