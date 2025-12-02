"use client";

import * as React from "react";
import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import { useAppData } from "@/context/app-data-context";
import type { Alert } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bus,
  Users,
  AlertCircle,
  Bell,
  Truck,
  Loader2,
  User,
} from "lucide-react";
import FuelPriceCard from "./fuel-price-card";
import CalendarCard from "./calendar-card";
import { cn } from "@/lib/utils";

// 🔥 Hardcoded Supabase credentials
const SUPABASE_URL = "https://jrgxheckjteefpavbhlm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3hoZWNranRlZWZwYXZiaGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNzUzMjUsImV4cCI6MjA2MTY1MTMyNX0.IgwV1vyiZRZqt8nl9WAcijI0AMSeoGqPf72go-OIwtM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function SummaryCards() {
  const { vehicles } = useAppData();

  const [activeAlerts, setActiveAlerts] = React.useState<Alert[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAlertsOpen, setIsAlertsOpen] = React.useState(false);
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);

  // Fetch alerts
  React.useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("timestamp", { ascending: false });

      if (!error && data) {
        const unread = data.filter((a: Alert) => !a.isRead);
        setActiveAlerts(unread);
      }

      setIsLoading(false);
    };

    fetchAlerts();

    // Realtime listener
    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  React.useEffect(() => {
    if (activeAlerts.length > 0 && !selectedAlert) {
      setSelectedAlert(activeAlerts[0]);
    } else if (activeAlerts.length === 0) {
      setSelectedAlert(null);
    }
  }, [activeAlerts, selectedAlert]);

  const alertCounts = activeAlerts.reduce(
    (acc, alert) => {
      if (alert.type === "Delay") acc.delays++;
      if (alert.type === "Maintenance Request") acc.maintenance++;
      return acc;
    },
    { delays: 0, maintenance: 0 }
  );

  const alertDescription = [
    alertCounts.delays > 0 &&
      `${alertCounts.delays} delay${alertCounts.delays > 1 ? "s" : ""}`,
    alertCounts.maintenance > 0 &&
      `${alertCounts.maintenance} maintenance request${
        alertCounts.maintenance > 1 ? "s" : ""
      }`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* === Buses Card === */}
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
          <Bus className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42</div>
          <p className="text-xs text-muted-foreground">out of 45 total buses</p>
        </CardContent>
      </Card>

      <CalendarCard />
      <FuelPriceCard />

      {/* === Drivers Card === */}
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Available Drivers
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">38</div>
          <p className="text-xs text-muted-foreground">4 drivers on standby</p>
        </CardContent>
      </Card>

      {/* === Alerts Card + Dialog === */}
      <Dialog open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
        <DialogTrigger asChild>
          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-destructive/20 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alerts
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive transition-transform duration-300 group-hover:scale-125" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[44px] flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-destructive">
                    {activeAlerts.length}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {alertDescription || "No active alerts"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-4xl h-[70vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Bell /> Active Alerts
            </DialogTitle>
            <CardDescription>
              Review and manage all current system and vehicle alerts.
            </CardDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden px-6 pb-6">
            {/* LEFT LIST */}
            <ScrollArea className="md:col-span-1 border rounded-lg h-full">
              <div className="p-2 space-y-1">
                {activeAlerts.map((alert) => {
                  const showComplaintTag =
                    alert?.title?.toLowerCase().includes("complaint") ||
                    alert?.type === "complaint" ||
                    alert?.is_complaint === true;

                  return (
                    <Button
                      key={alert.id}
                      variant="ghost"
                      className={cn(
                        "w-full h-auto justify-start text-left flex flex-col items-start p-3",
                        selectedAlert?.id === alert.id && "bg-accent"
                      )}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{alert.title}</p>

                        {/* ✅ Complaint Tag Logic (requested change) */}
                        {showComplaintTag && (
                          <span className="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded">
                            Complaint
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-normal">
                        {alert.description}
                      </p>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* RIGHT DETAILS */}
            <div className="md:col-span-2 h-full">
              {selectedAlert ? (
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{selectedAlert.title}</CardTitle>
                    <CardDescription>
                      {format(selectedAlert.timestamp, "PPPp")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm">{selectedAlert.details}</p>

                    {selectedAlert.vehicleId && (
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <Truck className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-semibold">
                            Vehicle Involved
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicles.find(
                              (v) => v.id === selectedAlert.vehicleId
                            )?.name || "Unknown Vehicle"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <User className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold">Reported By</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAlert.sender}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
                  <div className="text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto" />
                    <p className="mt-4 font-medium">No alerts to display</p>
                    <p className="text-sm">Everything is running smoothly.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
