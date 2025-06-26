
"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { useAppData } from "@/context/app-data-context"
import type { BusPass } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Edit, PlusCircle, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import BusPassCard from "./bus-pass-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"

const passFormSchema = z.object({
  holderName: z.string().min(1, "Pass holder name is required"),
  holderType: z.enum(['Student', 'Faculty']),
  vehicleId: z.string().min(1, "Vehicle selection is required"),
  seat: z.string().min(1, "Seat is required"),
  validFrom: z.date({ required_error: "A start date is required." }),
  validUntil: z.date({ required_error: "An end date is required." }),
})

type PassFormValues = z.infer<typeof passFormSchema>

export default function BusPassAdmin() {
  const { passes, vehicles, addPass, updatePass, removePass } = useAppData()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedPass, setSelectedPass] = React.useState<BusPass | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedPassForView, setSelectedPassForView] = React.useState<BusPass | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [passToDelete, setPassToDelete] = React.useState<BusPass | null>(null)
  const [busFilter, setBusFilter] = React.useState<string>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')

  const form = useForm<PassFormValues>({
    resolver: zodResolver(passFormSchema),
  })

  const handleEditClick = (pass: BusPass) => {
    setSelectedPass(pass)
    form.reset({
      holderName: pass.holderName,
      holderType: pass.holderType,
      vehicleId: pass.vehicleId,
      seat: pass.seat,
      validFrom: pass.validFrom,
      validUntil: pass.validUntil,
    })
    setIsDialogOpen(true)
  }
  
  const handleCreateClick = () => {
    setSelectedPass(null);
    form.reset({
      holderName: "",
      holderType: "Student",
      vehicleId: "",
      seat: "",
      validFrom: undefined,
      validUntil: undefined
    });
    setIsDialogOpen(true);
  }

  const handleViewClick = (pass: BusPass) => {
    setSelectedPassForView(pass)
    setIsViewDialogOpen(true)
  }

  const handleDeleteClick = (pass: BusPass) => {
    setPassToDelete(pass)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (passToDelete) {
      removePass(passToDelete.id)
    }
    setIsDeleteDialogOpen(false)
    setPassToDelete(null)
  }

  const onSubmit = (values: PassFormValues) => {
    if(selectedPass) {
      const vehicle = vehicles.find(v => v.id === values.vehicleId)
      updatePass({
        ...selectedPass,
        ...values,
        route: vehicle?.route || selectedPass.route,
      });
    } else {
      addPass(values)
    }
    setIsDialogOpen(false)
  }

  const getStatusVariant = (status: BusPass["status"]): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Active': return "default";
      case 'Expired': return "destructive";
      case 'Invalid': return "secondary";
    }
  }

  const filteredPasses = passes.filter(pass => {
    const busMatch = busFilter === 'all' || pass.vehicleId === busFilter;
    const typeMatch = typeFilter === 'all' || pass.holderType === typeFilter;
    return busMatch && typeMatch;
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Bus Passes</CardTitle>
                <CardDescription>Create, edit, and verify bus passes for students and faculty.</CardDescription>
            </div>
            <Button onClick={handleCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Pass
            </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 py-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="bus-filter">Filter by Bus</Label>
              <Select value={busFilter} onValueChange={setBusFilter}>
                <SelectTrigger id="bus-filter" className="w-[200px]">
                  <SelectValue placeholder="Select a bus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buses</SelectItem>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="type-filter">Filter by Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter" className="w-[180px]">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pass Holder</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredPasses.map((pass) => (
                    <motion.tr
                      key={pass.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <TableCell>
                        <div className="font-medium">{pass.holderName}</div>
                        <div className="text-sm text-muted-foreground">{pass.holderType}</div>
                      </TableCell>
                      <TableCell>
                        <div>{vehicles.find(v => v.id === pass.vehicleId)?.name}</div>
                        <div className="text-sm text-muted-foreground">Seat {pass.seat}</div>
                      </TableCell>
                      <TableCell>
                        {format(pass.validFrom, "LLL dd, y")} - {format(pass.validUntil, "LLL dd, y")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(pass.status)}>{pass.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleViewClick(pass)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>View Pass</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(pass)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Edit Pass</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(pass)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Delete Pass</p></TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPass ? "Edit Bus Pass" : "Create Bus Pass"}</DialogTitle>
            <DialogDescription>
                {selectedPass ? "Update the details for the bus pass." : "Enter the details for the new bus pass."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="holderName"
                  render={({ field }) => (
                    <FormItem><FormLabel>Pass Holder Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="holderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holder Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Faculty">Faculty</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger></FormControl>
                        <SelectContent>{vehicles.map(vehicle => (<SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="seat"
                    render={({ field }) => (
                        <FormItem><FormLabel>Seat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                    />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Valid From</FormLabel>
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
                 <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Valid Until</FormLabel>
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
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Pass</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-sm p-0 bg-transparent border-none shadow-none">
          {selectedPassForView && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Bus Pass: {selectedPassForView.holderName}</DialogTitle>
                <DialogDescription>
                  View and print the pass holder&apos;s bus pass.
                </DialogDescription>
              </DialogHeader>
              <BusPassCard pass={selectedPassForView} />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bus pass for {passToDelete?.holderName}.
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
