
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAppData } from "@/context/app-data-context"
import { cn } from "@/lib/utils"

export default function FleetStatusTable() {
  const { vehicles, drivers } = useAppData()

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'Unassigned'
    return drivers.find(d => d.id === driverId)?.name || 'Unassigned'
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
                <TableHead className="text-right">Seats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="font-medium">{vehicle.name}</div>
                    <div className="text-sm text-muted-foreground">{vehicle.route !== 'Unassigned' ? `Route ${vehicle.route}` : 'Unassigned'}</div>
                  </TableCell>
                  <TableCell>{getDriverName(vehicle.driverId)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {vehicle.availability.occupied}/{vehicle.availability.total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
