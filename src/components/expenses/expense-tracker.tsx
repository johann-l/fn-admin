"use client"

import * as React from "react"
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"

import { expenses, buses, Expense } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"

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
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>The latest recorded expenses for the fleet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{getBusName(expense.busId)}</TableCell>
                  <TableCell><Badge variant={getTypeVariant(expense.type)}>{expense.type}</Badge></TableCell>
                  <TableCell>{format(expense.date, "LLL dd, y")}</TableCell>
                  <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
