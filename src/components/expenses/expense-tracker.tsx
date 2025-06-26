"use client"

import * as React from "react"
import { useSearchParams } from 'next/navigation'
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"

import { expenses as initialExpenses, buses, Expense } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"
import { createCheckoutSession } from "@/app/actions/stripe"

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
  Other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;


export default function ExpenseTracker() {
  const [expenses, setExpenses] = React.useState<Expense[]>(initialExpenses)
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
        setExpenses(prevExpenses => 
          prevExpenses.map(exp => 
            exp.id === expenseId ? { ...exp, status: 'Paid' } : exp
          )
        )
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
  }, [searchParams]);

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
  
  const getBusName = (busId: string) => {
    return buses.find(b => b.id === busId)?.name || 'N/A'
  }
  
  const getTypeVariant = (type: Expense['type']): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'Fuel': return "default";
      case 'Maintenance': return "destructive";
      case 'Insurance': return "secondary";
      case 'Other': return "outline";
      default: return "default";
    }
  }

  const getStatusVariant = (status: Expense['status']): "default" | "destructive" => {
    return status === 'Paid' ? 'default' : 'destructive';
  }

  const filteredExpenses = (filter: 'all' | 'paid' | 'unpaid') => {
    switch (filter) {
      case 'paid':
        return expenses.filter(e => e.status === 'Paid');
      case 'unpaid':
        return expenses.filter(e => e.status === 'Unpaid');
      case 'all':
      default:
        return expenses;
    }
  }

  const ExpenseTable = ({ filter }: { filter: 'all' | 'paid' | 'unpaid' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Bus</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...filteredExpenses(filter)].sort((a, b) => b.date.getTime() - a.date.getTime()).map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">{expense.description}</TableCell>
            <TableCell>{getBusName(expense.busId)}</TableCell>
            <TableCell><Badge variant={getTypeVariant(expense.type)}>{expense.type}</Badge></TableCell>
            <TableCell>{format(expense.date, "LLL dd, y")}</TableCell>
            <TableCell><Badge variant={getStatusVariant(expense.status)}>{expense.status}</Badge></TableCell>
            <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              {expense.status === 'Unpaid' && (
                <form action={createCheckoutSession}>
                  <input type="hidden" name="expenseId" value={expense.id} />
                  <Button type="submit" size="sm">Pay Now</Button>
                </form>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Total Expenses</CardTitle>
                    <CardDescription>This month</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Across all categories</p>
                </CardContent>
            </Card>
            <Card>
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
                                   <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color} />
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
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="all">All Expenses</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ExpenseTable filter="all" />
            </TabsContent>
            <TabsContent value="unpaid">
              <ExpenseTable filter="unpaid" />
            </TabsContent>
            <TabsContent value="paid">
              <ExpenseTable filter="paid" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
