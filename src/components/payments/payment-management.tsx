"use client";

import * as React from "react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CalendarIcon } from "lucide-react";

import { useAppData } from "@/context/app-data-context";
import type { Payment } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutGrid,
  List,
} from "lucide-react";
import TransactionDetailCard from "./transaction-detail-card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createTransactionCheckoutSession } from "@/app/actions/stripe";

// Renaming Banknote import to avoid conflict with Banknote component from data
import { Banknote as BanknoteIcon } from "lucide-react";

const paymentFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero."),
  type: z.enum(["Incoming", "Outgoing"]),
  method: z.enum(["Credit Card", "Bank Transfer", "Cash"]),
  date: z.date({ required_error: "A payment date is required." }),
  status: z.enum(["Paid", "Pending", "Failed"]),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

function PayButton() {
  const { pending } = useFormStatus();
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
  );
}

export default function PaymentManagement() {
  const { payments } = useAppData();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = React.useState<"card" | "list">("card");
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [optimisticPaidIds, setOptimisticPaidIds] = React.useState<Set<string>>(
    new Set()
  );

  // Debug: Log when payments change
  React.useEffect(() => {
    console.log("PaymentManagement: Payments updated", payments.length);
  }, [payments]);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "Incoming",
      method: "Credit Card",
      date: new Date(),
      status: "Pending",
    },
  });

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Optimistically reflect Stripe success without refresh; realtime will confirm shortly
  React.useEffect(() => {
    const success = searchParams.get("success");
    const transactionId = searchParams.get("transaction_id");
    if (success === "true" && transactionId) {
      setOptimisticPaidIds((prev) => {
        const next = new Set(prev);
        next.add(transactionId);
        return next;
      });
    }
  }, [searchParams]);

  const handleCreateClick = () => {
    form.reset();
    setIsFormDialogOpen(true);
  };

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      // Get the current authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Generate a unique transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const insertRow = {
        id: transactionId,
        description: values.description,
        amount: values.amount,
        date: values.date.toISOString(),
        status: values.status,
        type: values.type,
        method: values.method,
        user_id: user?.id || null,
        reference_id: null,
        metadata: {},
      };

      console.log("Attempting to insert transaction:", insertRow);

      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert([insertRow])
        .select("*")
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }

      console.log("Transaction inserted successfully:", inserted);

      setIsFormDialogOpen(false);
      toast({
        title: "Payment Created",
        description: "The new payment has been successfully recorded.",
      });
      form.reset();

      // Reload the page to show the new payment immediately
      // The real-time subscription will handle future updates
      window.location.reload();
    } catch (err: any) {
      console.error("Insert error details:", {
        error: err,
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
      });
      toast({
        title: "Error creating payment",
        description:
          err?.message ||
          err?.hint ||
          "Failed to create payment. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const totalRevenue = payments
    .filter((p) => p.type === "Incoming" && p.status === "Paid")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalExpenses = payments
    .filter((p) => p.type === "Outgoing" && p.status === "Paid")
    .reduce((acc, p) => acc + p.amount, 0);

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const getStatusVariant = (
    status: Payment["status"]
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "Paid":
        return "default";
      case "Pending":
        return "secondary";
      case "Failed":
        return "destructive";
    }
  };

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "Paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Failed":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const filteredPayments = (filter: "all" | "incoming" | "outgoing") => {
    switch (filter) {
      case "incoming":
        return payments.filter((p) => p.type === "Incoming");
      case "outgoing":
        return payments.filter((p) => p.type === "Outgoing");
      case "all":
      default:
        return payments;
    }
  };

  const PaymentCards = ({
    filter,
  }: {
    filter: "all" | "incoming" | "outgoing";
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
      {[...filteredPayments(filter)]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((payment) => (
          <Card
            key={payment.id}
            className={cn(
              "group flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
              payment.type === "Incoming"
                ? "hover:shadow-primary/20"
                : "hover:shadow-destructive/20"
            )}
            onClick={() => handlePaymentClick(payment)}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium leading-none">
                  {payment.description}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isMounted ? format(payment.date, "PPpp") : "..."}
                </CardDescription>
              </div>
              {payment.type === "Incoming" ? (
                <ArrowUpRight className="h-5 w-5 text-primary shrink-0 transition-all duration-300 group-hover:translate-x-1" />
              ) : (
                <ArrowDownLeft className="h-5 w-5 text-destructive shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              )}
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div
                className={`text-2xl font-bold ${
                  payment.type === "Incoming"
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {payment.type === "Incoming" ? "+" : "-"}$
                {payment.amount.toFixed(2)}
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                {(() => {
                  const status = optimisticPaidIds.has(payment.id)
                    ? "Paid"
                    : payment.status;
                  return (
                    <Badge
                      variant={getStatusVariant(status)}
                      className="flex items-center gap-1 pl-1.5"
                    >
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </Badge>
                  );
                })()}
                <div className="flex items-center gap-1">
                  {payment.method === "Credit Card" ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <BanknoteIcon className="h-4 w-4" />
                  )}
                  <span>{payment.method}</span>
                </div>
              </div>
              {(payment.status === "Pending" || payment.status === "Failed") &&
                !optimisticPaidIds.has(payment.id) && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider>
                      <form action={createTransactionCheckoutSession}>
                        <input
                          type="hidden"
                          name="transactionId"
                          value={payment.id}
                        />
                        <input
                          type="hidden"
                          name="transactionDescription"
                          value={payment.description}
                        />
                        <input
                          type="hidden"
                          name="transactionAmount"
                          value={String(payment.amount)}
                        />
                        <input
                          type="hidden"
                          name="transactionType"
                          value={payment.type}
                        />
                        <PayButton />
                      </form>
                    </TooltipProvider>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
    </div>
  );

  const PaymentTable = ({
    filter,
  }: {
    filter: "all" | "incoming" | "outgoing";
  }) => (
    <div className="pt-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...filteredPayments(filter)]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((payment) => (
              <TableRow
                key={payment.id}
                className="cursor-pointer"
                onClick={() => handlePaymentClick(payment)}
              >
                <TableCell className="font-medium">
                  {payment.description}
                </TableCell>
                <TableCell>
                  {isMounted ? format(payment.date, "PP") : "..."}
                </TableCell>
                <TableCell>
                  <div
                    className={`font-semibold ${
                      payment.type === "Incoming"
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {payment.type === "Incoming" ? "+" : "-"}$
                    {payment.amount.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {payment.type === "Incoming" ? (
                      <ArrowUpRight className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="hidden lg:inline">{payment.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const status = optimisticPaidIds.has(payment.id)
                      ? "Paid"
                      : payment.status;
                    return (
                      <Badge
                        variant={getStatusVariant(status)}
                        className="flex items-center gap-1 pl-1.5 min-w-[70px] justify-center"
                      >
                        {getStatusIcon(status)}
                        <span>{status}</span>
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {payment.method === "Credit Card" ? (
                      <CreditCard className="h-4 w-4" />
                    ) : (
                      <BanknoteIcon className="h-4 w-4" />
                    )}
                    <span>{payment.method}</span>
                  </div>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(payment.status === "Pending" ||
                    payment.status === "Failed") &&
                    !optimisticPaidIds.has(payment.id) && (
                      <TooltipProvider>
                        <form action={createTransactionCheckoutSession}>
                          <input
                            type="hidden"
                            name="transactionId"
                            value={payment.id}
                          />
                          <input
                            type="hidden"
                            name="transactionDescription"
                            value={payment.description}
                          />
                          <input
                            type="hidden"
                            name="transactionAmount"
                            value={String(payment.amount)}
                          />
                          <input
                            type="hidden"
                            name="transactionType"
                            value={payment.type}
                          />
                          <PayButton />
                        </form>
                      </TooltipProvider>
                    )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                This month's paid income
              </p>
            </CardContent>
          </Card>
          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spending
              </CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                This month's paid expenses
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View and filter all incoming and outgoing payments.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-muted">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>List View</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "card" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("card")}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Card View</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button onClick={handleCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Payment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                <TabsTrigger value="all">All Transactions</TabsTrigger>
                <TabsTrigger value="incoming">Incoming</TabsTrigger>
                <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {viewMode === "card" ? (
                  <PaymentCards filter="all" />
                ) : (
                  <PaymentTable filter="all" />
                )}
              </TabsContent>
              <TabsContent value="incoming">
                {viewMode === "card" ? (
                  <PaymentCards filter="incoming" />
                ) : (
                  <PaymentTable filter="incoming" />
                )}
              </TabsContent>
              <TabsContent value="outgoing">
                {viewMode === "card" ? (
                  <PaymentCards filter="outgoing" />
                ) : (
                  <PaymentTable filter="outgoing" />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-sm p-0 bg-transparent border-none shadow-none">
          {selectedPayment && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>
                  Transaction Details: {selectedPayment.id}
                </DialogTitle>
                <DialogDescription>
                  Detailed view of transaction {selectedPayment.description}.
                </DialogDescription>
              </DialogHeader>
              <TransactionDetailCard payment={selectedPayment} />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
            <DialogDescription>
              Enter the payment details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Bus Pass Fee - Student"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Incoming">Incoming</SelectItem>
                          <SelectItem value="Outgoing">Outgoing</SelectItem>
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
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Credit Card">
                            Credit Card
                          </SelectItem>
                          <SelectItem value="Bank Transfer">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
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
                    <FormLabel>Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Payment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
