"use client"

import * as React from "react"
import { useSearchParams } from 'next/navigation'
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { useFormStatus } from "react-dom"
import { Loader2, Eye, PlusCircle, CalendarIcon } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/lib/supabase-types" // optional, if you have typed DB
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const expenseFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  type: z.enum(['Fuel', 'Maintenance', 'Insurance', 'Tolls', 'Misc', 'Other']),
  date: z.date({ required_error: "An expense date is required." }),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero."),
  status: z.enum(['Paid', 'Unpaid']),
  billUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

/**
 * DB row shape (loosely typed, derived from your schema)
 * Note: You can replace this with a generated type from your supabase typings if you have them.
 */
type DBExpense = {
  id: string
  vehicle_id: string | null
  filename: string | null
  description: string | null
  vehicle: string | null
  type: string | null
  status: string | null
  amount: string | number | null // numeric arrives as string from supabase
  date: string | null // ISO string
  file_url: string | null
  created_at?: string | null
}

const chartConfig = {
  total: { label: "Total" },
  Fuel: { label: "Fuel", color: "hsl(var(--chart-1))" },
  Maintenance: { label: "Maintenance", color: "hsl(var(--chart-2))" },
  Insurance: { label: "Insurance", color: "hsl(var(--chart-3))" },
  Tolls: { label: "Tolls", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--chart-5))" },
  Misc: { label: "Misc", color: "hsl(var(--chart-6))" },
} satisfies ChartConfig;

function PayButton() {
  const { pending } = useFormStatus()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="submit" size="sm" disabled={pending} className="w-[82px]">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay Now"}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Pay with Stripe</p>
      </TooltipContent>
    </Tooltip>
  )
}

const expenseTypes = ['Fuel', 'Maintenance', 'Insurance', 'Tolls', 'Misc', 'Other'] as const
type ExpenseType = (typeof expenseTypes)[number]
type ExpenseFilter = 'all' | ExpenseType

export default function ExpenseTracker() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const [loading, setLoading] = React.useState(true)
  const [expenses, setExpenses] = React.useState<DBExpense[]>([])
  const [vehicles, setVehicles] = React.useState<{ id: string; name: string }[]>([])

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      vehicleId: "",
      type: "Fuel",
      date: new Date(),
      amount: 0,
      status: "Unpaid",
      billUrl: "",
    },
  })

  const handleCreateClick = () => {
    form.reset()
    setIsDialogOpen(true)
  }

  // Fetch vehicles and expenses from Supabase
  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data: vData, error: vErr } = await supabase
        .from("vehicles")
        .select("id, name")
        .order("name", { ascending: true })

      if (vErr) throw vErr
      setVehicles(vData ?? [])

      const { data: eData, error: eErr } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })

      if (eErr) throw eErr
      setExpenses(eData ?? [])
    } catch (err: any) {
      console.error("Error fetching expenses/vehicles:", err)
      toast({
        title: "Error loading data",
        description: err?.message ?? "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle Stripe redirect status (success/cancel)
  React.useEffect(() => {
    if (searchParams.get('success')) {
      const expenseId = searchParams.get('expense_id')
      toast({
        title: "Payment Successful!",
        description: "Thank you for your payment.",
      })
      if (expenseId) {
        ;(async () => {
          const { error } = await supabase
            .from("expenses")
            .update({ status: "Paid" })
            .eq("id", expenseId)

          if (error) {
            toast({
              title: "Error updating expense",
              description: error.message,
              variant: "destructive",
            })
          } else {
            // Optimistically update local state
            setExpenses(prev => prev.map(e => (e.id === expenseId ? { ...e, status: "Paid" } : e)))
          }
        })()
      }
    }

    if (searchParams.get('canceled')) {
      toast({
        title: "Payment Canceled",
        description: "Your payment was not processed.",
        variant: "destructive",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const totalExpenses = React.useMemo(() => {
    if (!expenses) return 0
    return expenses.reduce((acc, expense) => {
      const amt = typeof expense.amount === "string" ? Number(expense.amount) : (expense.amount ?? 0)
      return acc + (isNaN(amt) ? 0 : amt)
    }, 0)
  }, [expenses])

  const expensesByType = React.useMemo(() => {
    if (!expenses) return {}
    return expenses.reduce((acc: Record<string, number>, expense) => {
      const type = expense.type ?? "Other"
      const amt = typeof expense.amount === "string" ? Number(expense.amount) : (expense.amount ?? 0)
      acc[type] = (acc[type] || 0) + (isNaN(amt) ? 0 : amt)
      return acc
    }, {})
  }, [expenses])

  const chartData = React.useMemo(() => {
    if (!expensesByType) return []
    return Object.entries(expensesByType).map(([name, total]) => ({ name, total: Math.floor(total) }))
  }, [expensesByType])

  const getVehicleName = (vehicleId?: string | null) => {
    if (!vehicleId) return 'N/A'
    return vehicles.find(v => v.id === vehicleId)?.name || 'N/A'
  }

  const getTypeVariant = (type?: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'Fuel': return "default";
      case 'Maintenance': return "destructive";
      case 'Insurance': return "secondary";
      case 'Tolls': return "outline";
      case 'Misc': return "outline";
      case 'Other': return "outline";
      default: return "default";
    }
  }

  const getStatusVariant = (status?: string | null): "default" | "destructive" => {
    return status === 'Paid' ? 'default' : 'destructive';
  }

  const filteredExpenses = (filter: ExpenseFilter) => {
    if (!expenses) return []
    if (filter === 'all') return expenses
    return expenses.filter(e => e.type === filter)
  }

  const handlePreviewClick = (expense: DBExpense) => {
    if (expense.file_url) {
      window.open(expense.file_url, "_blank")
    }
  }

  // Convert DBExpense to display-friendly object (date as Date, amount number)
  const displayDate = (rawDate: string | null) => {
    if (!rawDate) return null
    const d = new Date(rawDate)
    return isNaN(d.getTime()) ? null : d
  }

  // Add expense -> insert into Supabase
  const onSubmit = async (values: ExpenseFormValues) => {
    // derive filename from URL if provided
    const filename = values.billUrl ? (new URL(values.billUrl).pathname.split("/").pop() || null) : null
    const vehicleName = vehicles.find(v => v.id === values.vehicleId)?.name ?? null

    try {
      const insertRow = {
        description: values.description,
        vehicle_id: values.vehicleId || null,
        vehicle: vehicleName,
        type: values.type,
        status: values.status,
        amount: values.amount, // numeric column — supabase will accept number
        date: values.date.toISOString(),
        file_url: values.billUrl || null,
        filename: filename || null,
      }

      const { data: inserted, error: insertError } = await supabase
        .from("expenses")
        .insert([insertRow])
        .select("*")
        .single()

      if (insertError) throw insertError

      // append to local state
      setExpenses(prev => [inserted as DBExpense, ...prev])
      setIsDialogOpen(false)
      toast({
        title: "Expense Added",
        description: "The new expense has been successfully recorded.",
      })
      form.reset()
    } catch (err: any) {
      console.error("Insert error:", err)
      toast({
        title: "Error adding expense",
        description: err?.message ?? "Failed to add expense",
        variant: "destructive",
      })
    }
  }

  const ExpenseTable: React.FC<{ filter: ExpenseFilter }> = ({ filter }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Vehicle</TableHead>
          {filter === 'all' && <TableHead>Type</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredExpenses(filter)?.map((expense) => {
          const amountNum = typeof expense.amount === "string" ? Number(expense.amount) : (expense.amount ?? 0)
          const dateObj = displayDate(expense.date)
          return (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.description}</TableCell>
              <TableCell>{expense.vehicle || "N/A"}</TableCell>
              {filter === 'all' && <TableCell><Badge variant={getTypeVariant(expense.type)}>{expense.type}</Badge></TableCell>}
              <TableCell>{dateObj ? format(dateObj, "LLL dd, y") : "-"}</TableCell>
              <TableCell><Badge variant={getStatusVariant(expense.status)}>{expense.status ?? "-"}</Badge></TableCell>
              <TableCell className="text-right">${(isNaN(amountNum) ? 0 : amountNum).toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  {expense.file_url && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handlePreviewClick(expense)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preview Bill</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {expense.status !== 'Paid' && (
                    <form action={createCheckoutSession}>
                      <input type="hidden" name="expenseId" value={expense.id} />
                      <input type="hidden" name="expenseDescription" value={expense.description || ""} />
                      <input type="hidden" name="expenseAmount" value={String(amountNum)} />
                      <input type="hidden" name="expenseVehicleId" value={expense.vehicle_id || ""} />
                      <input type="hidden" name="expenseType" value={expense.type || ""} />
                      <PayButton />
                    </form>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
              <CardHeader>
                <CardTitle>Total Expenses</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Across all categories</p>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>A visual breakdown of spending for this month.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value} />
                    <YAxis domain={[0, 'dataMax + 100']} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="total" radius={4}>
                      {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={(chartConfig[entry.name as keyof typeof chartConfig] as any)?.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expense History</CardTitle>
                <CardDescription>View and pay for fleet expenses.</CardDescription>
              </div>
              <Button onClick={handleCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="h-auto flex-wrap justify-start gap-1">
                  <TabsTrigger value="all">All Expenses</TabsTrigger>
                  {expenseTypes.map(type => (
                    <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <ExpenseTable filter="all" />
                </TabsContent>

                {expenseTypes.map(type => (
                  <TabsContent key={type} value={type}>
                    <ExpenseTable filter={type} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Enter the details for the new expense. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Fuel top-up for Bus 1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expense Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
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
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/bill.pdf" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Expense</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
