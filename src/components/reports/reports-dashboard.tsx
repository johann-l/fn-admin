"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  subMonths,
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";
import { motion } from "framer-motion";
// --- FIX ---
// The aliased paths "@/..." could not be resolved by the build environment.
// Trying a different relative path.
import { supabase } from "../../lib/supabaseClient";
import { useAppData } from "../../context/app-data-context";
// --- END FIX ---

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

// Types
interface ExpenseData {
  type: string;
  amount: number;
  fill: string;
}

interface VehicleExpenseData {
  name: string;
  amount: number;
}

interface SupabaseExpense {
  type?: string;
  amount?: number;
  date?: string;
  vehicle?: string;
  status?: string;
  id?: string;
  description?: string;
}

// Updated to match incoming_reports table structure if needed
interface SupabaseTransaction {
  id?: string;
  amount?: number;
  // type?: string; // This might not be in 'incoming_reports'
  date?: string;
  description?: string;
}

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
} satisfies ChartConfig;

const revenueExpenseChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const occupancyChartConfig = {
  occupancy: {
    label: "Occupancy",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const fleetStatusChartConfig = {
  "On Time": { label: "On Time", color: "hsl(var(--chart-1))" },
  Delayed: { label: "Delayed", color: "hsl(var(--chart-3))" },
  Early: { label: "Early", color: "hsl(var(--chart-2))" },
  Maintenance: { label: "Maintenance", color: "hsl(var(--chart-4))" },
  "Out of Service": { label: "Out of Service", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const expenseByVehicleChartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const expenseCategories = Object.keys(expenseChartConfig).filter(
  (key) => key !== "expenses"
) as (keyof typeof expenseChartConfig)[];

// Helper function to get color for expense type
const getExpenseColor = (type: string): string => {
  const config = expenseChartConfig[type as keyof typeof expenseChartConfig];
  return config && "color" in config
    ? (config.color as string)
    : "hsl(var(--chart-1))";
};

// --- FIX ---
// Added types for context data to avoid implicit 'any'
interface AppDataPayment {
  date: Date;
  status: string;
  type: string;
  amount: number;
}
interface AppDataVehicle {
  name: string;
  availability: {
    occupied: number;
    total: number;
  };
  status: string;
}
interface AppDataExpense {
  type: string;
  amount: number;
}
// --- END FIX ---

export default function ReportsDashboard() {
  // --- FIX ---
  // Apply types to destructured context values
  const { expenses, vehicles, payments } = useAppData() as {
    expenses: AppDataExpense[];
    vehicles: AppDataVehicle[];
    payments: AppDataPayment[];
  };
  // --- END FIX ---

  const [activeExpense, setActiveExpense] = React.useState(0);
  const [activeStatus, setActiveStatus] = React.useState(0);
  const [timeFrame, setTimeFrame] = React.useState<"3m" | "6m" | "1y">("6m");
  const [summaryTimeFrame, setSummaryTimeFrame] = React.useState<
    "monthly" | "quarterly" | "6-months" | "yearly"
  >("monthly");

  const expenseData = React.useMemo(() => {
    if (!expenses) return [];
    const byType = expenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byType).map(([type, amount]) => ({
      type,
      amount,
      fill: getExpenseColor(type),
    }));
  }, [expenses]);

  const totalExpenses = React.useMemo(() => {
    if (!expenseData) return 0;
    return expenseData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenseData]);

  // Current month expense data from Supabase
  const [currentMonthExpenseData, setCurrentMonthExpenseData] = React.useState<
    ExpenseData[]
  >([]);
  const [totalCurrentMonthExpenses, setTotalCurrentMonthExpenses] =
    React.useState(0);

  const getCurrentMonthRange = React.useCallback(() => {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    ).toISOString();
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ).toISOString();
    return { start, end };
  }, []);

  const fetchCurrentMonthExpenses = React.useCallback(async () => {
    try {
      const { start, end } = getCurrentMonthRange();
      const { data: fetched, error } = await supabase
        .from("expenses")
        .select("type, amount, date")
        .gte("date", start)
        .lte("date", end);

      if (error) {
        console.error("Error fetching current month expenses:", error);
        return;
      }

      const grouped = ((fetched as SupabaseExpense[]) || []).reduce(
        (acc, exp) => {
          if (!exp.type) return acc;
          acc[exp.type] = (acc[exp.type] || 0) + Number(exp.amount || 0);
          return acc;
        },
        {} as Record<string, number>
      );

      const formatted: ExpenseData[] = Object.entries(grouped).map(
        ([type, amount]) => ({
          type,
          amount,
          fill: getExpenseColor(type),
        })
      );

      setCurrentMonthExpenseData(formatted);
      setTotalCurrentMonthExpenses(
        formatted.reduce((acc, cur) => acc + cur.amount, 0)
      );
    } catch (err) {
      console.error("fetchCurrentMonthExpenses error:", err);
    }
  }, [getCurrentMonthRange]);

  React.useEffect(() => {
    fetchCurrentMonthExpenses();

    const channel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          fetchCurrentMonthExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {
        // Ignore cleanup errors
      });
    };
  }, [fetchCurrentMonthExpenses]);

  // Expenses by Vehicle (current month)
  const [expenseByVehicleData, setExpenseByVehicleData] = React.useState<
    VehicleExpenseData[]
  >([]);

  const fetchExpenseByVehicle = React.useCallback(async () => {
    try {
      const { start, end } = getCurrentMonthRange();
      const { data: fetched, error } = await supabase
        .from("expenses")
        .select("vehicle, amount, date")
        .gte("date", start)
        .lte("date", end);

      if (error) {
        console.error("Error fetching expenses by vehicle:", error);
        return;
      }

      const grouped = ((fetched as SupabaseExpense[]) || []).reduce(
        (acc, exp) => {
          if (!exp.vehicle) return acc;
          acc[exp.vehicle] = (acc[exp.vehicle] || 0) + Number(exp.amount || 0);
          return acc;
        },
        {} as Record<string, number>
      );

      const formatted = Object.entries(grouped)
        .map(([vehicle, amount]) => ({
          name: vehicle,
          amount: Math.round(amount),
        }))
        .sort((a, b) => b.amount - a.amount);

      setExpenseByVehicleData(formatted);
    } catch (err) {
      console.error("fetchExpenseByVehicle error:", err);
    }
  }, [getCurrentMonthRange]);

  React.useEffect(() => {
    fetchExpenseByVehicle();

    const channel = supabase
      .channel("expenses-by-vehicle-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          fetchExpenseByVehicle();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {
        // Ignore cleanup errors
      });
    };
  }, [fetchExpenseByVehicle]);

  const revenueExpenseData = React.useMemo(() => {
    if (!payments) return [];

    const months = timeFrame === "3m" ? 3 : timeFrame === "6m" ? 6 : 12;
    const now = new Date();

    const monthlyRecords: {
      [key: string]: { revenue: number; expenses: number };
    } = {};

    for (let i = 0; i < months; i++) {
      const monthKey = format(subMonths(now, i), "yyyy-MM");
      monthlyRecords[monthKey] = { revenue: 0, expenses: 0 };
    }

    const startDate = subMonths(now, months);

    payments.forEach((payment) => {
      if (payment.date >= startDate && payment.status === "Paid") {
        const monthKey = format(payment.date, "yyyy-MM");
        if (monthlyRecords[monthKey]) {
          if (payment.type === "Incoming") {
            monthlyRecords[monthKey].revenue += payment.amount;
          } else {
            monthlyRecords[monthKey].expenses += payment.amount;
          }
        }
      }
    });

    return Object.keys(monthlyRecords)
      .sort()
      .map((monthKey) => ({
        month: format(new Date(monthKey + "-02"), "MMM"),
        revenue: Math.round(monthlyRecords[monthKey].revenue),
        expenses: Math.round(monthlyRecords[monthKey].expenses),
      }));
  }, [payments, timeFrame]);

  const vehicleOccupancyData = React.useMemo(() => {
    if (!vehicles) return [];
    return vehicles
      .map((v) => ({
        name: v.name,
        occupancy: parseFloat(
          ((v.availability.occupied / v.availability.total) * 100).toFixed(1)
        ),
      }))
      .sort((a, b) => b.occupancy - a.occupancy);
  }, [vehicles]);

  const fleetStatusData = React.useMemo(() => {
    if (!vehicles) return [];
    const byStatus = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byStatus).map(([status, count]) => {
      const config =
        fleetStatusChartConfig[status as keyof typeof fleetStatusChartConfig];
      return {
        status,
        count,
        fill:
          config && "color" in config
            ? (config.color as string)
            : "hsl(var(--chart-1))",
      };
    });
  }, [vehicles]);

  const totalVehicles = vehicles?.length || 0;

  // Financial Summary data from Supabase
  const [sbIncomePayments, setSbIncomePayments] = React.useState<
    SupabaseTransaction[]
  >([]);
  const [sbPaidExpenses, setSbPaidExpenses] = React.useState<SupabaseExpense[]>(
    []
  );

  const getSummaryRange = React.useCallback(() => {
    const now = new Date();
    switch (summaryTimeFrame) {
      case "monthly":
        return startOfMonth(now);
      case "quarterly":
        return startOfQuarter(now);
      case "6-months":
        return subMonths(now, 6);
      case "yearly":
        return startOfYear(now);
      default:
        return startOfMonth(now);
    }
  }, [summaryTimeFrame]);

  const fetchIncomingReports = React.useCallback(async () => {
    try {
      const start = getSummaryRange().toISOString();
      const { data: incomingData, error: incomingError } = await supabase
        .from("incoming_reports")
        .select("*")
        .gte("created_at", start);

      if (incomingError) {
        console.error("Error fetching incoming reports:", incomingError);
      } else {
        setSbIncomePayments((incomingData as SupabaseTransaction[]) || []);
      }
    } catch (err) {
      console.error("fetchIncomingReports error:", err);
    }
  }, [getSummaryRange]);

  const fetchSummaryExpenses = React.useCallback(async () => {
    try {
      const start = getSummaryRange().toISOString();
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("id, amount, status, type, date, description")
        .gte("date", start);

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError);
      } else {
        setSbPaidExpenses((expensesData as SupabaseExpense[]) || []);
      }
    } catch (err) {
      console.error("fetchSummaryExpenses error:", err);
    }
  }, [getSummaryRange]);

  React.useEffect(() => {
    fetchIncomingReports();
    const incomeChannel = supabase
      .channel("incoming-reports-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incoming_reports" },
        () => {
          fetchIncomingReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incomeChannel).catch(() => {});
    };
  }, [fetchIncomingReports]);

  React.useEffect(() => {
    fetchSummaryExpenses();
    const expenseChannel = supabase
      .channel("summary-expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          fetchSummaryExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expenseChannel).catch(() => {});
    };
  }, [fetchSummaryExpenses]);

  const incomePayments = sbIncomePayments;

  const totalIncome = React.useMemo(() => {
    return (incomePayments || []).reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    );
  }, [incomePayments]);

  const paidExpenses = sbPaidExpenses;

  const totalPaidExpenses = React.useMemo(() => {
    return (paidExpenses || []).reduce(
      (acc, e) => acc + Number(e.amount || 0),
      0
    );
  }, [paidExpenses]);

  const netProfit = React.useMemo(() => {
    return totalIncome - totalPaidExpenses;
  }, [totalIncome, totalPaidExpenses]);

  // ---FIXED SECTION---
  // The old, problematic categorizedIncome block has been removed.
  // This new block correctly displays the total income under a single category.
  const categorizedIncome = React.useMemo(() => {
    return [
      {
        category: "Bus Pass Fees",
        amount: totalIncome,
      },
    ];
  }, [totalIncome]);
  // ---END FIXED SECTION---

  const categorizedExpenses = React.useMemo(() => {
    if (!paidExpenses) return [];

    const initialCategories = expenseCategories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = (paidExpenses || []).reduce((acc, expense) => {
      const type = expense.type || "Other";
      if (Object.prototype.hasOwnProperty.call(acc, type)) {
        acc[type] += Number(expense.amount || 0);
      }
      return acc;
    }, initialCategories);

    return Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => {
        return (
          expenseCategories.indexOf(a.category as any) -
          expenseCategories.indexOf(b.category as any)
        );
      });
  }, [paidExpenses]);

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <motion.div
        className="lg:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Revenue vs. Expenses</CardTitle>
                <CardDescription>
                  Financial overview for the selected period.
                </CardDescription>
              </div>
              <Tabs
                value={timeFrame}
                onValueChange={(value) => setTimeFrame(value as any)}
                className="w-auto"
              >
                <TabsList className="h-8">
                  <TabsTrigger value="3m" className="h-6 px-2 text-xs">
                    3M
                  </TabsTrigger>
                  <TabsTrigger value="6m" className="h-6 px-2 text-xs">
                    6M
                  </TabsTrigger>
                  <TabsTrigger value="1y" className="h-6 px-2 text-xs">
                    1Y
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={revenueExpenseChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                data={revenueExpenseData}
                margin={{ left: -20, right: 12 }}
              >
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 h-full">
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
                  data={currentMonthExpenseData}
                  dataKey="amount"
                  nameKey="type"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={activeExpense}
                  onMouseEnter={(_, index) => setActiveExpense(index)}
                >
                  {currentMonthExpenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="type" />}
                  className="-mt-4 flex-wrap gap-x-4 gap-y-1"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardContent className="mt-0 flex-col gap-2 text-sm">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${totalCurrentMonthExpenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 h-full">
          <CardHeader>
            <CardTitle>Expenses by Vehicle</CardTitle>
            <CardDescription>Total spending per vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={expenseByVehicleChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={expenseByVehicleData}
                layout="vertical"
                margin={{ left: 0, right: 20 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={80}
                  tickFormatter={(value) =>
                    value.length > 10 ? `${value.substring(0, 8)}...` : value
                  }
                />
                <XAxis
                  dataKey="amount"
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 h-full">
          <CardHeader>
            <CardTitle>Vehicle Occupancy Rate</CardTitle>
            <CardDescription>
              Average seat occupancy per vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={occupancyChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={vehicleOccupancyData}
                margin={{ left: 12, right: 12 }}
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
                <Bar
                  dataKey="occupancy"
                  fill="var(--color-occupancy)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 h-full">
          <CardHeader className="items-center pb-0">
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>
              Live distribution of vehicle statuses
            </CardDescription>
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
                  className="-mt-4 flex-wrap gap-x-4 gap-y-1"
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
      </motion.div>

      <motion.div
        className="lg:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>
                  Detailed breakdown of income and expenses.
                </CardDescription>
              </div>
              <Tabs
                value={summaryTimeFrame}
                onValueChange={(value) => setSummaryTimeFrame(value as any)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-8">
                  <TabsTrigger value="monthly" className="h-6 px-2 text-xs">
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger value="quarterly" className="h-6 px-2 text-xs">
                    Quarterly
                  </TabsTrigger>
                  <TabsTrigger value="6-months" className="h-6 px-2 text-xs">
                    6 Months
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="h-6 px-2 text-xs">
                    Yearly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Income</h3>
                <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto max-h-80">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm">
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categorizedIncome.map((p) => (
                          <TableRow key={p.category}>
                            <TableCell className="font-medium">
                              {p.category}
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary">
                              +${p.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold p-4 border-t bg-card/95 backdrop-blur-sm">
                    <span>Total Income</span>
                    <span className="text-primary">
                      ${totalIncome.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Expenses</h3>
                <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto max-h-80">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm">
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categorizedExpenses.map((e) => (
                          <TableRow key={e.category}>
                            <TableCell className="font-medium">
                              {e.category}
                            </TableCell>
                            <TableCell className="text-right font-medium text-destructive">
                              -${e.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold p-4 border-t bg-card/95 backdrop-blur-sm">
                    <span>Total Expenses</span>
                    <span className="text-destructive">
                      ${totalPaidExpenses.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Net Profit</span>
                <span
                  className={
                    netProfit >= 0 ? "text-primary" : "text-destructive"
                  }
                >
                  {netProfit < 0 ? "-" : ""}${Math.abs(netProfit).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
