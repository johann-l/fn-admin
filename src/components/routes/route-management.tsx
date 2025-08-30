"use client";

import { useState } from "react";
import RouteFormModal from "./RouteFormModal";

type Route = {
  id: number;
  name: string;
  vehicle: string;
  stops: { lat: number; lng: number }[];
};

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([
    { id: 1, name: "Route 101", vehicle: "Bus 1", stops: [] },
    { id: 2, name: "Route 202", vehicle: "Bus 2", stops: [] },
    { id: 3, name: "Route 303", vehicle: "Bus 3", stops: [] },
  ]);

  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const handleSave = (route: Route) => {
    if (route.id) {
      setRoutes((prev) => prev.map((r) => (r.id === route.id ? route : r)));
    } else {
      setRoutes((prev) => [...prev, { ...route, id: prev.length + 1 }]);
    }
    setEditingRoute(null);
  };

  return (
    <div className="bg-neutral-900 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Routes</h2>
        <button
          onClick={() =>
            setEditingRoute({ id: 0, name: "", vehicle: "", stops: [] })
          }
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
        >
          Create Route
        </button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2">Route Name</th>
            <th className="p-2">Stops</th>
            <th className="p-2">Vehicle</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id} className="border-b border-gray-800">
              <td className="p-2">{route.name}</td>
              <td className="p-2">{route.stops.length}</td>
              <td className="p-2">{route.vehicle || "—"}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => setEditingRoute(route)}
                  className="text-blue-400 hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingRoute && (
        <RouteFormModal
          route={editingRoute}
          onSave={handleSave}
          onClose={() => setEditingRoute(null)}
        />
      )}
    </div>
  );
}
