import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { buses, drivers } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function FleetStatusTable() {
  const getDriverName = (driverId: string) => {
    return drivers.find(d => d.id === driverId)?.name || 'Unassigned'
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'On Time': return "default";
      case 'Delayed': return "destructive";
      case 'Early': return "secondary";
      case 'Maintenance': return "outline";
      default: return "default";
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fleet Status</CardTitle>
        <CardDescription>Live overview of all active buses.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[calc(100vh-320px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Bus</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Seats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell>
                    <div className="font-medium">{bus.name}</div>
                    <div className="text-sm text-muted-foreground">{bus.route}</div>
                  </TableCell>
                  <TableCell>{getDriverName(bus.driverId)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(bus.status)}>{bus.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {bus.availability.occupied}/{bus.availability.total}
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
