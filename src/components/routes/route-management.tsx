
"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"

import { useAppData } from "@/context/app-data-context"
import type { Route } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const routeFormSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  stops: z.string().min(1, "At least one stop is required"),
})

type RouteFormValues = z.infer<typeof routeFormSchema>

export default function RouteManagement() {
  const { routes, vehicles, addRoute, updateRoute, removeRoute } = useAppData()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedRoute, setSelectedRoute] = React.useState<Route | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [routeToDelete, setRouteToDelete] = React.useState<Route | null>(null)

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
  })

  const getVehicleForRoute = (routeId: string) => {
    return vehicles.find(v => v.routeId === routeId)
  }

  const handleEditClick = (route: Route) => {
    setSelectedRoute(route)
    form.reset({
      name: route.name,
      stops: route.stops.join('\n'),
    })
    setIsDialogOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedRoute(null);
    form.reset({
      name: "",
      stops: "",
    });
    setIsDialogOpen(true);
  }

  const handleDeleteClick = (route: Route) => {
    setRouteToDelete(route)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (routeToDelete) {
      removeRoute(routeToDelete.id)
    }
    setIsDeleteDialogOpen(false)
    setRouteToDelete(null)
  }

  const onSubmit = (values: RouteFormValues) => {
    const routeData = {
      name: values.name,
      stops: values.stops.split('\n').filter(stop => stop.trim() !== ''),
    }

    if (selectedRoute) {
      updateRoute({ ...selectedRoute, ...routeData });
    } else {
      addRoute(routeData);
    }
    setIsDialogOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Routes</CardTitle>
            <CardDescription>Define and manage all bus routes.</CardDescription>
          </div>
          <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Route
          </Button>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Assigned Vehicle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {routes.map((route) => {
                    const assignedVehicle = getVehicleForRoute(route.id);
                    return (
                      <motion.tr
                        key={route.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.stops.length}</TableCell>
                        <TableCell>{assignedVehicle?.name || 'Unassigned'}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(route)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Edit Route</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(route)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete Route</p></TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRoute ? "Edit Route" : "Create New Route"}</DialogTitle>
            <DialogDescription>
              {selectedRoute ? "Update the route details." : "Enter details for the new route."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Name</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Downtown Express" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stops"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stops (one per line)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Main St & 1st Ave&#10;Oak Street & 5th Ave&#10;University Main Gate"
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Route</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the route "{routeToDelete?.name}" and unassign it from any vehicles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
