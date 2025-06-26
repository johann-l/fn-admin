"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { drivers, Driver, buses } from "@/lib/data"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Eye } from "lucide-react"
import DriverIdCard from "./driver-id-card"

const driverFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.enum(["Active", "Suspended", "Inactive"]),
  assignedBusId: z.string().nullable(),
})

type DriverFormValues = z.infer<typeof driverFormSchema>

export default function DriverManagement() {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [selectedDriverForEdit, setSelectedDriverForEdit] = React.useState<Driver | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedDriverForView, setSelectedDriverForView] = React.useState<Driver | null>(null)

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "Inactive",
      assignedBusId: null,
    },
  })

  const handleEditClick = (driver: Driver) => {
    setSelectedDriverForEdit(driver)
    form.reset({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      status: driver.status,
      assignedBusId: driver.assignedBusId,
    })
    setIsEditDialogOpen(true)
  }

  const handleViewClick = (driver: Driver) => {
    setSelectedDriverForView(driver)
    setIsViewDialogOpen(true)
  }

  const onSubmit = (values: DriverFormValues) => {
    console.log("Updated driver data:", values)
    // Here you would typically call an API to update the driver data
    setIsEditDialogOpen(false)
  }

  const getStatusVariant = (status: Driver["status"]): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Active': return "default";
      case 'Suspended': return "destructive";
      case 'Inactive': return "secondary";
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
          <CardDescription>View and manage all driver profiles in the fleet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assigned Bus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`${driver.avatarUrl}?${driver.id}`} alt={driver.name} data-ai-hint="person avatar"/>
                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{driver.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{driver.email}</div>
                    <div className="text-xs text-muted-foreground">{driver.phone}</div>
                  </TableCell>
                  <TableCell>{buses.find(b => b.id === driver.assignedBusId)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(driver.status)}>{driver.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewClick(driver)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(driver)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Driver Profile</DialogTitle>
            <DialogDescription>
              Make changes to {selectedDriverForEdit?.name}'s profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedBusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Bus</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a bus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {buses.map(bus => (
                            <SelectItem key={bus.id} value={bus.id}>{bus.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-sm p-0 bg-transparent border-none shadow-none">
          {selectedDriverForView && <DriverIdCard driver={selectedDriverForView} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
