
"use client"

import * as React from "react"
import { format } from "date-fns"

import { payments, Payment } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PlusCircle, ArrowUpRight, ArrowDownLeft, CreditCard, CheckCircle2, XCircle, Clock, LayoutGrid, List } from "lucide-react"
import TransactionDetailCard from "./transaction-detail-card"
import { cn } from "@/lib/utils"

// Renaming Banknote import to avoid conflict with Banknote component from data
import { Banknote as BanknoteIcon } from "lucide-react"


export default function PaymentManagement() {
  const [viewMode, setViewMode] = React.useState<'card' | 'list'>('card');
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalRevenue = payments
    .filter(p => p.type === 'Incoming' && p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalExpenses = payments
    .filter(p => p.type === 'Outgoing' && p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);
    
  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const getStatusVariant = (status: Payment["status"]): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Paid': return "default";
      case 'Pending': return "secondary";
      case 'Failed': return "destructive";
    }
  }

  const getStatusIcon = (status: Payment["status"]) => {
    switch(status) {
        case 'Paid': return <CheckCircle2 className="h-4 w-4" />;
        case 'Pending': return <Clock className="h-4 w-4" />;
        case 'Failed': return <XCircle className="h-4 w-4" />;
    }
  }

  const filteredPayments = (filter: 'all' | 'incoming' | 'outgoing') => {
    switch (filter) {
      case 'incoming':
        return payments.filter(p => p.type === 'Incoming');
      case 'outgoing':
        return payments.filter(p => p.type === 'Outgoing');
      case 'all':
      default:
        return payments;
    }
  }

  const PaymentCards = ({ filter }: { filter: 'all' | 'incoming' | 'outgoing' }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
      {[...filteredPayments(filter)].sort((a, b) => b.date.getTime() - a.date.getTime()).map((payment) => (
        <Card 
          key={payment.id} 
          className={cn(
            "group flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            payment.type === 'Incoming' ? "hover:shadow-primary/10" : "hover:shadow-destructive/10"
          )}
          onClick={() => handlePaymentClick(payment)}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium leading-none">{payment.description}</CardTitle>
              <CardDescription className="text-xs">{isMounted ? format(payment.date, "PPpp") : '...'}</CardDescription>
            </div>
            {payment.type === 'Incoming' ? 
              <ArrowUpRight className="h-5 w-5 text-primary shrink-0 transition-all duration-300 group-hover:translate-x-1" /> : 
              <ArrowDownLeft className="h-5 w-5 text-destructive shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
            }
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className={`text-2xl font-bold ${payment.type === 'Incoming' ? 'text-primary' : 'text-destructive'}`}>
              {payment.type === 'Incoming' ? '+' : '-'}${payment.amount.toFixed(2)}
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <Badge variant={getStatusVariant(payment.status)} className="flex items-center gap-1 pl-1.5">
                    {getStatusIcon(payment.status)}
                    <span>{payment.status}</span>
                </Badge>
                <div className="flex items-center gap-1">
                    {payment.method === 'Credit Card' ? <CreditCard className="h-4 w-4" /> : <BanknoteIcon className="h-4 w-4" />}
                    <span>{payment.method}</span>
                </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const PaymentTable = ({ filter }: { filter: 'all' | 'incoming' | 'outgoing' }) => (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...filteredPayments(filter)].sort((a, b) => b.date.getTime() - a.date.getTime()).map((payment) => (
            <TableRow 
              key={payment.id} 
              className="cursor-pointer" 
              onClick={() => handlePaymentClick(payment)}
            >
              <TableCell className="font-medium">{payment.description}</TableCell>
              <TableCell>{isMounted ? format(payment.date, "PP") : '...'}</TableCell>
              <TableCell>
                <div className={`font-semibold ${payment.type === 'Incoming' ? 'text-primary' : 'text-destructive'}`}>
                  {payment.type === 'Incoming' ? '+' : '-'}${payment.amount.toFixed(2)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    {payment.type === 'Incoming' ? 
                        <ArrowUpRight className="h-4 w-4 text-primary shrink-0" /> : 
                        <ArrowDownLeft className="h-4 w-4 text-destructive shrink-0" />
                    }
                    <span className="hidden lg:inline">{payment.type}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(payment.status)} className="flex items-center gap-1 pl-1.5 min-w-[70px] justify-center">
                  {getStatusIcon(payment.status)}
                  <span>{payment.status}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                    {payment.method === 'Credit Card' ? <CreditCard className="h-4 w-4" /> : <BanknoteIcon className="h-4 w-4" />}
                    <span>{payment.method}</span>
                </div>
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
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">This month's paid income</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                      <ArrowDownLeft className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">This month's paid expenses</p>
                  </CardContent>
              </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View and filter all incoming and outgoing payments.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-muted">
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
                                      <List className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>List View</p>
                              </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('card')}>
                                      <LayoutGrid className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>Card View</p>
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  </div>
                  <Button>
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
                {viewMode === 'card' ? <PaymentCards filter="all" /> : <PaymentTable filter="all" />}
              </TabsContent>
              <TabsContent value="incoming">
                {viewMode === 'card' ? <PaymentCards filter="incoming" /> : <PaymentTable filter="incoming" />}
              </TabsContent>
              <TabsContent value="outgoing">
                {viewMode === 'card' ? <PaymentCards filter="outgoing" /> : <PaymentTable filter="outgoing" />}
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
                <DialogTitle>Transaction Details: {selectedPayment.id}</DialogTitle>
                <DialogDescription>
                  Detailed view of transaction {selectedPayment.description}.
                </DialogDescription>
              </DialogHeader>
              <TransactionDetailCard payment={selectedPayment} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
