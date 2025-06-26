
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAppData } from "@/context/app-data-context"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function FleetStatusTable() {
  const { vehicles, drivers, routes } = useAppData()

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'Unassigned'
    return drivers.find(d => d.id === driverId)?.name || 'Unassigned'
  }

  const getRouteName = (routeId: string | null) => {
    if (!routeId) return 'Unassigned'
    return routes.find(r => r.id === routeId)?.name || 'Unassigned'
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'On Time': return "default";
      case 'Delayed': return "destructive";
      case 'Early': return "secondary";
      case 'Maintenance': return "outline";
      case 'Out of Service': return "outline";
      default: return "default";
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fleet Status</CardTitle>
        <CardDescription>Live overview of all active vehicles.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[calc(100vh-320px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Route Progress</TableHead>
                <TableHead className="text-right">Seats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => {
                const route = routes.find((r) => r.id === vehicle.routeId)
                const totalStops = route ? route.stops.length : 0
                const currentStopIndex = vehicle.currentStopIndex

                return (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="font-medium">{vehicle.name}</div>
                      <div className="text-sm text-muted-foreground">{getRouteName(vehicle.routeId)}</div>
                    </TableCell>
                    <TableCell>{getDriverName(vehicle.driverId)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {vehicle.status !== 'Out of Service' &&
                      vehicle.status !== 'Maintenance' &&
                      route &&
                      currentStopIndex >= 0 ? (
                        <TooltipProvider>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-default">
                                {Array.from({ length: totalStops }).map((_, index) => (
                                  <div
                                    key={index}
                                    className={cn(
                                      'h-2 w-2 rounded-full transition-colors',
                                      index <= currentStopIndex
                                        ? 'bg-primary'
                                        : 'bg-muted'
                                    )}
                                  />
                                ))}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Stop {currentStopIndex + 1} of {totalStops}
                                {route.stops[currentStopIndex] && `: ${route.stops[currentStopIndex]}`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {vehicle.availability.occupied}/{vehicle.availability.total}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
