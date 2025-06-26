
"use client"

import * as React from "react"
import { useSearchParams } from 'next/navigation'
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { useFormStatus } from "react-dom"
import { Loader2, Eye } from "lucide-react"

import type { Expense } from "@/lib/data"
import { useAppData } from "@/context/app-data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const chartConfig = {
  total: {
    label: "Total",
  },
  Fuel: {
      label: "Fuel",
      color: "hsl(var(--chart-1))",
  },
  Maintenance: {
      label: "Maintenance",
      color: "hsl(var(--chart-2))",
  },
  Insurance: {
      label: "Insurance",
      color: "hsl(var(--chart-3))",
  },
  Tolls: {
    label: "Tolls",
    color: "hsl(var(--chart-4))",
  },
  Other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
  },
  Misc: {
    label: "Misc",
    color: "hsl(var(--chart-6))",
  },
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

const expenseTypes: Expense['type'][] = ['Fuel', 'Maintenance', 'Insurance', 'Tolls', 'Misc', 'Other'];
type ExpenseFilter = 'all' | Expense['type'];

export default function ExpenseTracker() {
  const { vehicles, expenses, updateExpense } = useAppData()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  React.useEffect(() => {
    if (searchParams.get('success')) {
      const expenseId = searchParams.get('expense_id')
      toast({
        title: "Payment Successful!",
        description: "Thank you for your payment.",
      })
      if (expenseId) {
        updateExpense(expenseId, { status: 'Paid' })
      }
    }

    if (searchParams.get('canceled')) {
      toast({
        title: "Payment Canceled",
        description: "Your payment was not processed.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast, updateExpense]);

  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0)

  const expensesByType = expenses.reduce((acc, expense) => {
    const type = expense.type
    if (!acc[type]) {
      acc[type] = 0
    }
    acc[type] += expense.amount
    return acc
  }, {} as Record<Expense['type'], number>)

  const chartData = Object.entries(expensesByType).map(([name, total]) => ({ name, total: Math.floor(total) }))
  
  const getVehicleName = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)?.name || 'N/A'
  }
  
  const getTypeVariant = (type: Expense['type']): "default" | "secondary" | "destructive" | "outline" => {
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

  const getStatusVariant = (status: Expense['status']): "default" | "destructive" => {
    return status === 'Paid' ? 'default' : 'destructive';
  }

  const filteredExpenses = (filter: ExpenseFilter) => {
    if (filter === 'all') {
      return expenses;
    }
    return expenses.filter(e => e.type === filter);
  }

  const handlePreviewClick = (expense: Expense) => {
    if (expense.billUrl) {
      window.open(expense.billUrl, "_blank");
    }
  };

  const ExpenseTable = ({ filter }: { filter: ExpenseFilter }) => (
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
        {[...filteredExpenses(filter)].sort((a, b) => b.date.getTime() - a.date.getTime()).map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">{expense.description}</TableCell>
            <TableCell>{getVehicleName(expense.vehicleId)}</TableCell>
            {filter === 'all' && <TableCell><Badge variant={getTypeVariant(expense.type)}>{expense.type}</Badge></TableCell>}
            <TableCell>{format(expense.date, "LLL dd, y")}</TableCell>
            <TableCell><Badge variant={getStatusVariant(expense.status)}>{expense.status}</Badge></TableCell>
            <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-1">
                {expense.billUrl && (
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
                {expense.status === 'Unpaid' && (
                  <form action={createCheckoutSession}>
                    <input type="hidden" name="expenseId" value={expense.id} />
                    <PayButton />
                  </form>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
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
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>View and pay for fleet expenses.</CardDescription>
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
  )
}
