// src/components/routes/RouteManagement.tsx
"use client";

import { useEffect, useState } from "react";
import RouteFormModal, { Route } from "./RouteFormModal";
import RouteViewModal from "../map/RouteViewModal";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";

// DB row helpers
type DBPath = { id: string; name: string; vehicle: string | null };
type DBPoint = {
  id: string;
  path_id: string;
  name: string | null;
  lat: number | string | null;
  lng: number | string | null;
  order: number | null;
};

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [viewingRoute, setViewingRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch routes + points
  useEffect(() => {
    const loadRoutes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("paths").select(`
          id,
          name,
          vehicle,
          points (
            id,
            name,
            lat,
            lng,
            "order"
          )
        `);

        if (error) throw error;

        const routesWithStops = (data || []).map((route) => ({
          id: route.id,
          name: route.name,
          vehicle: route.vehicle || "",
          stops: (route.points || []).sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          ),
        }));

        setRoutes(routesWithStops);
      } catch (err: any) {
        console.error("Supabase load error:", err.message ?? err);
        alert("Failed to load routes.");
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  // Save route to Supabase
  const handleSave = async (route: Route) => {
    try {
      let pathId = route.id;

      if (!pathId) {
        const { data: newPath, error: insertError } = await supabase
          .from("paths")
          .insert([{ name: route.name, vehicle: route.vehicle }])
          .select()
          .single();

        if (insertError) throw insertError;
        pathId = newPath.id;
      } else {
        const { error: updateError } = await supabase
          .from("paths")
          .update({ name: route.name, vehicle: route.vehicle })
          .eq("id", pathId);
        if (updateError) throw updateError;
      }

      // Delete old points
      await supabase.from("points").delete().eq("path_id", pathId);

      // Insert new stops
      const pointsToInsert = route.stops.map((stop, index) => ({
        path_id: pathId,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        order: index,
      }));

      if (pointsToInsert.length) {
        const { error: pointsError } = await supabase
          .from("points")
          .insert(pointsToInsert);
        if (pointsError) throw pointsError;
      }

      // Update local state
      setRoutes((prev) => {
        const exists = prev.some((r) => r.id === pathId);
        const updatedRoute = { ...route, id: pathId };
        return exists
          ? prev.map((r) => (r.id === pathId ? updatedRoute : r))
          : [...prev, updatedRoute];
      });

      setEditingRoute(null);
    } catch (err: any) {
      console.error("Supabase save error:", err.message ?? err);
      alert("Failed to save route.");
    }
  };

  // Delete route
  const handleDelete = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await supabase.from("points").delete().eq("path_id", routeId);
      await supabase.from("paths").delete().eq("id", routeId);
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    } catch (err: any) {
      console.error("Supabase delete error:", err.message ?? err);
      alert("Failed to delete route.");
    }
  };

  return (
    <div className="bg-neutral-900 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Routes</h2>
        <button
          onClick={() => setEditingRoute({ name: "", vehicle: "", stops: [] })}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
        >
          Create Route
        </button>
      </div>

      {loading ? (
        <p className="text-white">Loading routes…</p>
      ) : (
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">View</th>
              <th className="p-2">Route Name</th>
              <th className="p-2">Stops</th>
              <th className="p-2">Vehicle</th>
              <th className="p-2">Edit</th>
              <th className="p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-b border-gray-800">
                <td className="p-2">
                  <button onClick={() => setViewingRoute(route)}>
                    <EyeIcon className="w-5 h-5 text-blue-400 mx-auto" />
                  </button>
                </td>
                <td className="p-2">{route.name}</td>
                <td className="p-2">{route.stops.length}</td>
                <td className="p-2">{route.vehicle}</td>
                <td className="p-2">
                  <button onClick={() => setEditingRoute(route)}>
                    <PencilSquareIcon className="w-5 h-5 text-green-400 mx-auto" />
                  </button>
                </td>
                <td className="p-2">
                  <button onClick={() => route.id && handleDelete(route.id)}>
                    <TrashIcon className="w-5 h-5 text-red-500 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingRoute && (
        <RouteFormModal
          route={editingRoute}
          onSave={handleSave}
          onClose={() => setEditingRoute(null)}
        />
      )}

      {viewingRoute && (
        <RouteViewModal
          route={viewingRoute}
          onClose={() => setViewingRoute(null)}
        />
      )}
    </div>
  );
}
