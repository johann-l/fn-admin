"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Fuel } from "lucide-react";

type FuelInfo = { name: string; price: string; unit: string };

export default function FuelPriceCard() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [fuelData, setFuelData] = React.useState<FuelInfo[]>([
    { name: "Petrol", price: "102.92", unit: "₹/L" },
    { name: "Diesel", price: "90.03", unit: "₹/L" },
    { name: "LPG", price: "852.50", unit: "₹/cylinder" },
    { name: "CNG", price: "77", unit: "₹/kg" },
  ]);
  const [loading, setLoading] = React.useState(true);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Fetch fuel prices from Supabase Edge Function using hardcoded anon key
  const fetchFuelPrices = async () => {
    try {
      const res = await fetch(
        "https://jrgxheckjteefpavbhlm.supabase.co/functions/v1/fuel-prices",
        {
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3hoZWNranRlZWZwYXZiaGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNzUzMjUsImV4cCI6MjA2MTY1MTMyNX0.IgwV1vyiZRZqt8nl9WAcijI0AMSeoGqPf72go-OIwtM",
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      setFuelData([
        { name: "Petrol", price: data.bangalore.petrol, unit: "₹/L" },
        { name: "Diesel", price: data.bangalore.diesel, unit: "₹/L" },
        { name: "LPG", price: data.bangalore.lpg, unit: "₹/cylinder" },
        { name: "CNG", price: data.bangalore.cng, unit: "₹/kg" },
      ]);
    } catch (err) {
      console.error("Error fetching fuel prices:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFuelPrices();
    const interval = setInterval(fetchFuelPrices, 600000); // refresh every 10 mins
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!api) return;
    // You can add event listeners here if needed
  }, [api]);

  return (
    <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Fuel Prices</CardTitle>
        <Fuel className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-xs text-muted-foreground">
            Fetching latest prices...
          </div>
        ) : (
          <Carousel
            setApi={setApi}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {fuelData.map((fuel, index) => (
                <CarouselItem key={index}>
                  <div className="text-2xl font-bold">{fuel.price}</div>
                  <p className="text-xs text-muted-foreground">
                    {fuel.name} ({fuel.unit})
                  </p>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}
