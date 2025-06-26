
"use client"

import * as React from "react"
import { format } from "date-fns"
import { useAppData } from "@/context/app-data-context"
import type { Alert } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bus, Clock, Users, AlertCircle, Bell, Truck } from "lucide-react"
import FuelPriceCard from "./fuel-price-card"
import { cn } from "@/lib/utils"

export default function SummaryCards() {
  const { alerts, vehicles } = useAppData()
  const [isAlertsOpen, setIsAlertsOpen] = React.useState(false)
  const activeAlerts = alerts.filter(a => !a.isRead)
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(activeAlerts.length > 0 ? activeAlerts[0] : null)

  const alertCounts = activeAlerts.reduce((acc, alert) => {
    if (alert.type === 'Delay') acc.delays++
    if (alert.type === 'Maintenance Request') acc.maintenance++
    return acc
  }, { delays: 0, maintenance: 0 })

  const alertDescription = [
    alertCounts.delays > 0 && `${alertCounts.delays} delay${alertCounts.delays > 1 ? 's' : ''}`,
    alertCounts.maintenance > 0 && `${alertCounts.maintenance} maintenance request${alertCounts.maintenance > 1 ? 's' : ''}`,
  ].filter(Boolean).join(', ')

  React.useEffect(() => {
    if (activeAlerts.length > 0 && !selectedAlert) {
      setSelectedAlert(activeAlerts[0]);
    } else if (activeAlerts.length === 0) {
      setSelectedAlert(null);
    }
  }, [activeAlerts, selectedAlert]);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">92.1%</div>
          <p className="text-xs text-muted-foreground">+2.5% from last week</p>
        </CardContent>
      </Card>
      <FuelPriceCard />
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">38</div>
          <p className="text-xs text-muted-foreground">4 drivers on standby</p>
        </CardContent>
      </Card>
      
      <Dialog open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
        <DialogTrigger asChild>
          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-destructive/20 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive transition-transform duration-300 group-hover:scale-125" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{activeAlerts.length}</div>
              <p className="text-xs text-muted-foreground truncate">{alertDescription || 'No active alerts'}</p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[70vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl flex items-center gap-2"><Bell /> Active Alerts</DialogTitle>
            <CardDescription>Review and manage all current system and vehicle alerts.</CardDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden px-6 pb-6">
            <ScrollArea className="md:col-span-1 border rounded-lg h-full">
              <div className="p-2 space-y-1">
                {activeAlerts.map(alert => (
                  <Button
                    key={alert.id}
                    variant="ghost"
                    className={cn(
                        "w-full h-auto justify-start text-left flex flex-col items-start p-3",
                        selectedAlert?.id === alert.id && "bg-accent"
                    )}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-xs text-muted-foreground font-normal">{alert.description}</p>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="md:col-span-2 h-full">
              {selectedAlert ? (
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{selectedAlert.title}</CardTitle>
                    <CardDescription>{format(selectedAlert.timestamp, "PPPp")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm">{selectedAlert.details}</p>
                    {selectedAlert.vehicleId && (
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <Truck className="h-6 w-6 text-muted-foreground" />
                        <div>
                           <p className="text-sm font-semibold">Vehicle Involved</p>
                           <p className="text-sm text-muted-foreground">{vehicles.find(v => v.id === selectedAlert.vehicleId)?.name || 'Unknown Vehicle'}</p>
                        </div>
                      </div>
                    )}
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
  )
}
