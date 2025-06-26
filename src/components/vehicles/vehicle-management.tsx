"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

import { useAppData } from "@/context/app-data-context"
import type { Vehicle } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Edit, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const vehicleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1990, "Year must be after 1990"),
  licensePlate: z.string().min(1, "License plate is required"),
  driverId: z.string().nullable(),
  status: z.enum(['On Time', 'Delayed', 'Early', 'Maintenance', 'Out of Service']),
  lastService: z.date({ required_error: "Last service date is required." }),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

export default function VehicleManagement() {
  const { vehicles, drivers, addVehicle, updateVehicle } = useAppData()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null)

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
  })

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    form.reset({
      name: vehicle.name,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      driverId: vehicle.driverId,
      status: vehicle.status,
      lastService: vehicle.lastService,
    })
    setIsDialogOpen(true)
  }
  
  const handleCreateClick = () => {
    setSelectedVehicle(null);
    form.reset({
        name: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
        driverId: null,
        status: "On Time",
        lastService: new Date(),
    });
    setIsDialogOpen(true);
  }

  const onSubmit = (values: VehicleFormValues) => {
    if(selectedVehicle) {
      updateVehicle({ ...selectedVehicle, ...values });
    } else {
      addVehicle(values)
    }
    setIsDialogOpen(false)
  }

  const getStatusVariant = (status: Vehicle["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'On Time': return "default";
      case 'Delayed': return "destructive";
      case 'Early': return "secondary";
      case 'Maintenance': return "outline";
      case 'Out of Service': return "destructive";
      default: return "default";
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Fleet Vehicles</CardTitle>
                <CardDescription>Manage and monitor all vehicles in the fleet.</CardDescription>
            </div>
            <Button onClick={handleCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vehicle
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="font-medium">{vehicle.name}</div>
                    <div className="text-sm text-muted-foreground">{vehicle.model} ({vehicle.year})</div>
                  </TableCell>
                  <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                  <TableCell>{drivers.find(d => d.id === vehicle.driverId)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(vehicle.lastService, "LLL dd, y")}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(vehicle)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            <DialogDescription>
                {selectedVehicle ? "Update vehicle details." : "Enter details for the new vehicle."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem><FormLabel>Vehicle Name</FormLabel><FormControl><Input {...field} placeholder="e.g., City Cruiser 1" /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                    <FormItem><FormLabel>License Plate</FormLabel><FormControl><Input {...field} placeholder="e.g., CC-001" /></FormControl><FormMessage /></FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                    <FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} placeholder="e.g., Mercedes Sprinter" /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                    <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Driver</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a driver" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {drivers.map(driver => (<SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="On Time">On Time</SelectItem>
                            <SelectItem value="Delayed">Delayed</SelectItem>
                            <SelectItem value="Early">Early</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Out of Service">Out of Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <FormField
                  control={form.control}
                  name="lastService"
                  render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Last Service Date</FormLabel>
                      <Popover><PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover><FormMessage /></FormItem>
                  )}
                />
            
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Vehicle</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
