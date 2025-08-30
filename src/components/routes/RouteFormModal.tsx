"use client";

import { useState } from "react";
import MapPickerModal from "../map/MapPickerModal";

export interface Stop {
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id?: string;
  name: string;
  stops: Stop[];
}

export default function RouteFormModal({
  route,
  onClose,
  onSave,
}: {
  route?: Route;
  onClose: () => void;
  onSave: (route: Route) => void;
}) {
  const [routeName, setRouteName] = useState(route?.name || "");
  const [stops, setStops] = useState<Stop[]>(route?.stops || []);
  const [showMap, setShowMap] = useState(false);

  const handleSave = () => {
    if (!routeName.trim()) return alert("Route name is required!");
    if (stops.length < 2) return alert("A route must have at least 2 stops!");

    const newRoute: Route = {
      id: route?.id || crypto.randomUUID(),
      name: routeName,
      stops,
    };

    onSave(newRoute);
    onClose();
  };

  const handleRemoveStop = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-background rounded-lg shadow-lg w-[600px] p-6">
        <h2 className="text-xl font-semibold mb-4">
          {route ? "Edit Route" : "Create Route"}
        </h2>

        {/* Route name */}
        <input
          type="text"
          placeholder="Route Name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        {/* Stops */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Stops</h3>
          {stops.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">No stops added yet.</p>
          )}
          {stops.map((stop, i) => (
            <div
              key={i}
              className="flex justify-between items-center border rounded px-2 py-1 mb-2"
            >
              <span>
                {stop.name} ({stop.lat.toFixed(4)}, {stop.lng.toFixed(4)})
              </span>
              <button
                onClick={() => handleRemoveStop(i)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowMap(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            + Add Stop from Map
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-500 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Save Route
          </button>
        </div>
      </div>

      {/* Map modal */}
      {showMap && (
        <MapPickerModal
          onSelect={(lat, lng) => {
            setStops((prev) => [
              ...prev,
              { name: `Stop ${prev.length + 1}`, lat, lng },
            ]);
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
