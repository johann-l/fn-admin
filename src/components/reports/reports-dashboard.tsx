
"use client"

import * as React from "react"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, CartesianGrid, XAxis, YAxis } from "recharts"
import { subMonths, format } from "date-fns"

import { useAppData } from "@/context/app-data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const expenseChartConfig = {
  expenses: {
    label: "Expenses",
  },
  Fuel: { label: "Fuel", color: "hsl(var(--chart-1))" },
  Maintenance: { label: "Maintenance", color: "hsl(var(--chart-2))" },
  Insurance: { label: "Insurance", color: "hsl(var(--chart-3))" },
  Tolls: { label: "Tolls", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--chart-5))" },
  Misc: { label: "Misc", color: "hsl(var(--chart-6))" },
} satisfies ChartConfig

const revenueExpenseChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const occupancyChartConfig = {
    occupancy: {
      label: "Occupancy",
      color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const fleetStatusChartConfig = {
    'On Time': { label: "On Time", color: "hsl(var(--chart-1))" },
    'Delayed': { label: "Delayed", color: "hsl(var(--chart-3))" },
    'Early': { label: "Early", color: "hsl(var(--chart-2))" },
    'Maintenance': { label: "Maintenance", color: "hsl(var(--chart-4))" },
    'Out of Service': { label: "Out of Service", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

export default function ReportsDashboard() {
  const { expenses, vehicles, payments } = useAppData()
  const [activeExpense, setActiveExpense] = React.useState(0);
  const [activeStatus, setActiveStatus] = React.useState(0);
  const [timeFrame, setTimeFrame] = React.useState<"3m" | "6m" | "1y">("6m");

  const expenseData = React.useMemo(() => {
    const byType = expenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(byType).map(([type, amount]) => ({
      type,
      amount,
      fill: (expenseChartConfig[type as keyof typeof expenseChartConfig] as any)?.color || 'hsl(var(--chart-1))'
    }))
  }, [expenses])
  
  const totalExpenses = React.useMemo(() => {
    return expenseData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [expenseData])

  const revenueExpenseData = React.useMemo(() => {
    if (!payments) return []

    const months = timeFrame === "3m" ? 3 : timeFrame === "6m" ? 6 : 12
    const now = new Date()

    const monthlyRecords: { [key: string]: { revenue: number; expenses: number } } = {}

    // Initialize last 'months' months
    for (let i = 0; i < months; i++) {
      const monthKey = format(subMonths(now, i), "yyyy-MM")
      monthlyRecords[monthKey] = { revenue: 0, expenses: 0 }
    }

    const startDate = subMonths(now, months)

    payments.forEach((payment) => {
      if (payment.date >= startDate && payment.status === "Paid") {
        const monthKey = format(payment.date, "yyyy-MM")
        if (monthlyRecords[monthKey]) {
          if (payment.type === "Incoming") {
            monthlyRecords[monthKey].revenue += payment.amount
          } else {
            monthlyRecords[monthKey].expenses += payment.amount
          }
        }
      }
    })

    return Object.keys(monthlyRecords)
      .sort()
      .map((monthKey) => ({
        month: format(new Date(monthKey + "-02"), "MMM"), // Adding -02 to avoid timezone issues with -01
        revenue: Math.round(monthlyRecords[monthKey].revenue),
        expenses: Math.round(monthlyRecords[monthKey].expenses),
      }))
  }, [payments, timeFrame])


  const vehicleOccupancyData = React.useMemo(() => {
    return vehicles.map(v => ({
      name: v.name,
      occupancy: parseFloat(((v.availability.occupied / v.availability.total) * 100).toFixed(1)),
    })).sort((a, b) => b.occupancy - a.occupancy);
  }, [vehicles])


  const fleetStatusData = React.useMemo(() => {
    const byStatus = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(byStatus).map(([status, count]) => ({
      status,
      count,
      fill: (fleetStatusChartConfig[status as keyof typeof fleetStatusChartConfig] as any)?.color || 'hsl(var(--chart-1))'
    }))
  }, [vehicles])

  const totalVehicles = vehicles.length;


  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-1">
            <CardHeader className="items-center pb-0">
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Monthly spending by category</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={expenseChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={expenseData}
                    dataKey="amount"
                    nameKey="type"
                    innerRadius={60}
                    strokeWidth={5}
                    activeIndex={activeExpense}
                    onMouseEnter={(_, index) => setActiveExpense(index)}
                  >
                     {expenseData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="type" />}
                    className="-mt-4"
                  />
                </PieChart>
                </ChartContainer>
            </CardContent>
            <CardContent className="mt-0 flex-col gap-2 text-sm">
                <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${totalExpenses.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>

        <Card className="xl:col-span-2">
           <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Revenue vs. Expenses</CardTitle>
                        <CardDescription>Financial overview for the selected period.</CardDescription>
                    </div>
                    <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)} className="w-auto">
                        <TabsList className="h-8">
                            <TabsTrigger value="3m" className="h-6 px-2 text-xs">3M</TabsTrigger>
                            <TabsTrigger value="6m" className="h-6 px-2 text-xs">6M</TabsTrigger>
                            <TabsTrigger value="1y" className="h-6 px-2 text-xs">1Y</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={revenueExpenseChartConfig} className="h-[300px] w-full">
                    <BarChart data={revenueExpenseData} margin={{ left: -20, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey="revenue"
                            fill="var(--color-revenue)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="expenses"
                            fill="var(--color-expenses)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Vehicle Occupancy Rate</CardTitle>
                <CardDescription>Average seat occupancy per vehicle</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={occupancyChartConfig} className="h-[300px] w-full">
                <BarChart
                    accessibilityLayer
                    data={vehicleOccupancyData}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="occupancy" fill="var(--color-occupancy)" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="xl:col-span-1">
            <CardHeader className="items-center pb-0">
                <CardTitle>Fleet Status</CardTitle>
                <CardDescription>Live distribution of vehicle statuses</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                 <ChartContainer
                    config={fleetStatusChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={fleetStatusData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                    activeIndex={activeStatus}
                    onMouseEnter={(_, index) => setActiveStatus(index)}
                  >
                     {fleetStatusData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="-mt-4"
                  />
                </PieChart>
                </ChartContainer>
            </CardContent>
            <CardContent className="mt-0 flex-col gap-2 text-sm">
                <div className="flex justify-between font-medium">
                    <span>Total Vehicles</span>
                    <span>{totalVehicles}</span>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
