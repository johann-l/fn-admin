"use client";

import { useState, useEffect } from "react";
import MapPickerModal from "../map/MapPickerModal";
import { supabase } from "@/lib/supabaseClient";

export interface Stop {
  id?: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id?: string;
  name: string;
  vehicle: string;
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
  const [vehicle, setVehicle] = useState(route?.vehicle || "");
  const [stops, setStops] = useState<Stop[]>(route?.stops || []);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (route) {
      setRouteName(route.name);
      setVehicle(route.vehicle);
      setStops(route.stops || []);
    }
  }, [route]);

  const handleSave = async () => {
    if (!routeName.trim()) return alert("Route name is required!");
    if (!vehicle.trim()) return alert("Bus number is required!");
    if (stops.length < 2) return alert("A route must have at least 2 stops!");

    let pathId = route?.id;

    try {
      // --- Create or update route ---
      if (!pathId) {
        const { data: newPath, error: insertError } = await supabase
          .from("paths")
          .insert([{ name: routeName, vehicle }])
          .select()
          .single();
        if (insertError) throw insertError;
        pathId = newPath.id;
      } else {
        const { error: updateError } = await supabase
          .from("paths")
          .update({ name: routeName, vehicle })
          .eq("id", pathId);
        if (updateError) throw updateError;
      }

      // --- Delete old stops ---
      await supabase.from("points").delete().eq("path_id", pathId);

      // --- Insert new stops ---
      const stopsToInsert = stops.map((s, i) => ({
        path_id: pathId,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        order: i,
      }));

      if (stopsToInsert.length) {
        const { error: pointsError } = await supabase
          .from("points")
          .insert(stopsToInsert);
        if (pointsError) throw pointsError;
      }

      onSave({ id: pathId, name: routeName, vehicle, stops });
      onClose();
    } catch (err: any) {
      console.error("Supabase save error:", err);
      alert("Failed to save route: " + JSON.stringify(err));
    }
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

        <input
          type="text"
          placeholder="Route Name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        />

        <input
          type="text"
          placeholder="Bus Number"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

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

      {showMap && (
        <MapPickerModal
          routeId={route?.id || ""} // optional for Supabase linking
          stops={stops}
          onSelect={(lat, lng, name) =>
            setStops((prev) => [...prev, { lat, lng, name }])
          }
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
