// src/components/routes/RouteManagement.tsx
"use client";

import { useEffect, useState } from "react";
import RouteFormModal, { Route } from "./RouteFormModal";
import RouteViewModal from "../map/RouteViewModal";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
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

        console.log("SUPABASE DATA:", data);
        console.log("SUPABASE ERROR:", error);

        if (error) throw error;

        const routesWithStops = (data || []).map((route) => ({
          id: route.id,
          name: route.name,
          vehicle: route.vehicle,
          stops: (route.points || []).sort((a, b) => a.order - b.order),
        }));

        setRoutes(routesWithStops);
      } catch (err: any) {
        console.error("Supabase save error:", err.message ?? err);
        alert("Failed to save route.");
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

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
        pathId = newPath.id;
      } else {
        // Update existing path
        const { error: UpdateError } = await supabase
          .from("paths")
          .update({ name: route.name, vehicle: route.vehicle })
          .eq("id", pathId);

        if (UpdateError) {
          console.error("Update error:", UpdateError);
          throw UpdateError;
        }
      }

      // Delete old points for this path
      await supabase.from("points").delete().eq("path_id", pathId);

      // Insert stops
      const pointsToInsert = route.stops.map((stop, index) => ({
        path_id: pathId,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        order: index,
      }));

      // Insert stops into points
      if (pointsToInsert.length) {
        const { data: insertedPoints, error: pointsError } = await supabase
          .from("points")
          .insert(pointsToInsert)
          .select();

        if (pointsError) {
          console.error("❌ Error inserting points:", pointsError);
          throw pointsError;
        } else {
          console.log("✅ Inserted points:", insertedPoints);
        }
      }

      // Update local state
      setRoutes((prev) => {
        const exists = prev.some((r) => r.id === pathId);
        if (exists) {
          return prev.map((r) =>
            r.id === pathId ? { ...route, id: pathId } : r
          );
        } else {
          return [...prev, { ...route, id: pathId }];
        }
      });

      alert("Route saved!");
      setEditingRoute(null);
    } catch (err: any) {
      console.error("Supabase save error:", err.message ?? err);
      alert("Failed to save route.");
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
