"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";

const vehicleSchema = z.object({
  name: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  year: z.number().min(1900).max(2100),
  licensePlate: z.string().min(1, "Required"),
  driverId: z.string().optional(),
  routeId: z.string().optional(),
  status: z.string(),
  lastService: z.string(),
  totalSeats: z.number().min(1),
  occupiedSeats: z.number().min(0),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function FleetOverview() {
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = React.useState<any | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<any | null>(
    null
  );

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      driverId: "none",
      routeId: "none",
      status: "On Time",
      lastService: new Date().toISOString().split("T")[0],
      totalSeats: 40,
      occupiedSeats: 0,
    },
  });

  // Fetch vehicles on load
  const fetchVehicles = async () => {
    const { data, error } = await supabase.from("vehicles").select("*");
    if (error) console.error("Error fetching vehicles:", error);
    else setVehicles(data || []);
  };

  React.useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle Add / Update
  const onSubmit = async (values: VehicleFormValues) => {
    const finalValues = {
      name: values.name,
      model: values.model,
      year: values.year,
      license_plate: values.licensePlate,
      driver_id: values.driverId === "none" ? null : values.driverId,
      route_id: values.routeId === "none" ? null : values.routeId,
      status: values.status,
      last_service_date: values.lastService,
      total_seats: values.totalSeats,
      occupied_seats: values.occupiedSeats,
    };

    if (selectedVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update(finalValues)
        .eq("id", selectedVehicle.id);
      if (error) console.error("Error updating vehicle:", error);
    } else {
      const newVehicle = { id: uuidv4(), ...finalValues };
      const { error } = await supabase.from("vehicles").insert([newVehicle]);
      if (error) console.error("Error adding vehicle:", error);
    }

    setIsDialogOpen(false);
    setSelectedVehicle(null);
    form.reset();
    fetchVehicles();
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleToDelete.id);
      if (error) console.error("Error deleting vehicle:", error);
    }
    setIsDeleteDialogOpen(false);
    setVehicleToDelete(null);
    fetchVehicles();
  };

  const openEditDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    form.reset({
      name: vehicle.name,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.license_plate,
      driverId: vehicle.driver_id || "none",
      routeId: vehicle.route_id || "none",
      status: vehicle.status,
      lastService: vehicle.last_service_date,
      totalSeats: vehicle.total_seats,
      occupiedSeats: vehicle.occupied_seats,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedVehicle(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Fleet Overview</h1>
        <Button onClick={openAddDialog}>Add Vehicle</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Seats</TableHead>
            <TableHead>Occupied</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.name}</TableCell>
              <TableCell>{v.model}</TableCell>
              <TableCell>{v.year}</TableCell>
              <TableCell>{v.license_plate}</TableCell>
              <TableCell>{v.status}</TableCell>
              <TableCell>{v.total_seats}</TableCell>
              <TableCell>{v.occupied_seats}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(v)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setVehicleToDelete(v);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Vehicle Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 mt-2"
          >
            <div>
              <Label>Name</Label>
              <Input {...form.register("name")} />
            </div>

            <div>
              <Label>Model</Label>
              <Input {...form.register("model")} />
            </div>

            <div>
              <Label>Year</Label>
              <Input
                type="number"
                {...form.register("year", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label>License Plate</Label>
              <Input {...form.register("licensePlate")} />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                onValueChange={(val) => form.setValue("status", val)}
                defaultValue={form.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Time">On Time</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Early">Early</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Last Service Date</Label>
              <Input type="date" {...form.register("lastService")} />
            </div>

            <div>
              <Label>Total Seats</Label>
              <Input
                type="number"
                {...form.register("totalSeats", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label>Occupied Seats</Label>
              <Input
                type="number"
                {...form.register("occupiedSeats", { valueAsNumber: true })}
              />
            </div>

            <DialogFooter>
              <Button type="submit">
                {selectedVehicle ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this vehicle?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}