"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

import { passes, BusPass, buses } from "@/lib/data"
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
  DialogTrigger,
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

const passFormSchema = z.object({
  passengerName: z.string().min(1, "Passenger name is required"),
  busId: z.string().min(1, "Bus selection is required"),
  seat: z.string().min(1, "Seat is required"),
  validFrom: z.date({ required_error: "A start date is required." }),
  validUntil: z.date({ required_error: "An end date is required." }),
})

type PassFormValues = z.infer<typeof passFormSchema>

export default function BusPassAdmin() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedPass, setSelectedPass] = React.useState<BusPass | null>(null)

  const form = useForm<PassFormValues>({
    resolver: zodResolver(passFormSchema),
  })

  const handleEditClick = (pass: BusPass) => {
    setSelectedPass(pass)
    form.reset({
      passengerName: pass.passengerName,
      busId: pass.busId,
      seat: pass.seat,
      validFrom: pass.validFrom,
      validUntil: pass.validUntil,
    })
    setIsDialogOpen(true)
  }
  
  const handleCreateClick = () => {
    setSelectedPass(null);
    form.reset({
      passengerName: "",
      busId: "",
      seat: "",
      validFrom: undefined,
      validUntil: undefined
    });
    setIsDialogOpen(true);
  }

  const onSubmit = (values: PassFormValues) => {
    if(selectedPass) {
      console.log("Updated pass data:", values)
    } else {
      console.log("Created new pass:", values)
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Passenger Bus Passes</CardTitle>
                <CardDescription>Create, edit, and verify passenger bus passes.</CardDescription>
            </div>
            <Button onClick={handleCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Pass
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passenger</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passes.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell className="font-medium">{pass.passengerName}</TableCell>
                  <TableCell>
                    <div>{buses.find(b => b.id === pass.busId)?.name}</div>
                    <div className="text-sm text-muted-foreground">Seat {pass.seat}</div>
                  </TableCell>
                  <TableCell>
                    {format(pass.validFrom, "LLL dd, y")} - {format(pass.validUntil, "LLL dd, y")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(pass.status)}>{pass.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(pass)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPass ? "Edit Bus Pass" : "Create Bus Pass"}</DialogTitle>
            <DialogDescription>
                {selectedPass ? "Update the details for the bus pass." : "Enter the details for the new bus pass."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="passengerName"
                render={({ field }) => (
                  <FormItem><FormLabel>Passenger Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="busId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bus</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a bus" /></SelectTrigger></FormControl>
                        <SelectContent>{buses.map(bus => (<SelectItem key={bus.id} value={bus.id}>{bus.name}</SelectItem>))}</SelectContent>
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
    </>
  )
}
