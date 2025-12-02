"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface LatLng {
  lat: number;
  lng: number;
}

// 🚌 Bus stops
const busStops: LatLng[] = [
  { lat: 12.80844040331948, lng: 74.89364123399675 },
  { lat: 12.819459292923097, lng: 74.8784272810079 },
  { lat: 12.818440530915483, lng: 74.86529114313304 },
  { lat: 12.81844657910358, lng: 74.85868868324373 },
  { lat: 12.825245114682806, lng: 74.85983867582144 },
  { lat: 12.849938790374326, lng: 74.8621455669695 },
  { lat: 12.911771642419597, lng: 74.89749712438976 },
];

export default function BusRouteMap() {
  const [stopReached, setStopReached] = useState<boolean[]>(
    busStops.map(() => false)
  );
  const [busPos, setBusPos] = useState<LatLng>(busStops[0]);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // 🧭 Get realistic driving route once map is ready
  useEffect(() => {
    if (!isLoaded || !window.google) return;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: busStops[0],
        destination: busStops[busStops.length - 1],
        waypoints: busStops
          .slice(1, -1)
          .map((stop) => ({ location: stop, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  }, [isLoaded]);

  // ✅ LIVE COORDINATES FROM SUPABASE (driver_locations)
  useEffect(() => {
    const supabaseUrl = "https://ltdxlajzilbvmipcuqxd.supabase.co"; // 🔹 replace with your Supabase URL
    const supabaseAnonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHhsYWp6aWxidm1pcGN1cXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTQxMDEsImV4cCI6MjA3MDMzMDEwMX0.si0smbCAHPa7w9qbhzErQpo8rWJ7_vyZWPYXyJrHzBE";

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log("📡 Subscribing to driver_locations realtime...");

    const channel = supabase
      .channel("realtime-driver")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "driver_locations" },
        (payload) => {
          const newData = payload.new;
          if (!newData) return;

          // only handle updates for driver_001
          if (newData.driver_id === "driver_001") {
            const newPos = {
              lat: newData.latitude,
              lng: newData.longitude,
            };
            console.log("📍 Live update from driver_001:", newPos);
            setBusPos(newPos);
            updateReachedStops(newPos);
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🧹 Unsubscribed from realtime updates.");
      supabase.removeChannel(channel);
    };
  }, []);

  // 🧭 Update which stops are reached
  const updateReachedStops = (curr: LatLng) => {
    setStopReached((prevReached) =>
      prevReached.map((reached, idx) => {
        if (reached) return true;
        const dist = haversineDistance(curr, busStops[idx]);
        return dist < 0.15; // ≈150 meters threshold
      })
    );
  };

  // 📏 Distance between two coords in km
  const haversineDistance = (a: LatLng, b: LatLng): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s1 = Math.sin(dLat / 2);
    const s2 = Math.sin(dLng / 2);
    const aa =
      s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
    return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  };

  const mapCenter = busStops[0];

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="text-sm text-red-600">Missing Google Maps API key.</div>
    );
  }

  return (
    <Card className="h-[400px] lg:h-[calc(100vh-250px)]">
      <CardContent className="p-0 h-full">
        {!isLoaded ? (
          <div className="flex items-center justify-center h-full text-sm">
            Loading map...
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
            onLoad={(map) => (mapRef.current = map)}
          >
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#007BFF",
                    strokeOpacity: 0.7,
                    strokeWeight: 5,
                  },
                }}
              />
            )}
            {busStops.map((stop, i) => (
              <Marker
                key={i}
                position={stop}
                icon={{
                  url: stopReached[i]
                    ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            ))}
            <Marker
              position={busPos}
              icon={{
                url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
                scaledSize: new window.google.maps.Size(35, 35),
              }}
            />
          </GoogleMap>
        )}
      </CardContent>
    </Card>
  );
}
