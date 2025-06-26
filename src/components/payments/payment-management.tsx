"use client"

import * as React from "react"
import { format } from "date-fns"

import { payments, Payment } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react"

export default function PaymentManagement() {
  const totalRevenue = payments
    .filter(p => p.type === 'Incoming' && p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalExpenses = payments
    .filter(p => p.type === 'Outgoing' && p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const getStatusVariant = (status: Payment["status"]): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Paid': return "default";
      case 'Pending': return "secondary";
      case 'Failed': return "destructive";
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

  const PaymentTable = ({ filter }: { filter: 'all' | 'incoming' | 'outgoing' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...filteredPayments(filter)].sort((a, b) => b.date.getTime() - a.date.getTime()).map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">{payment.description}</TableCell>
            <TableCell>{format(payment.date, "LLL dd, y")}</TableCell>
            <TableCell>
              <Badge variant={payment.type === 'Incoming' ? 'default' : 'secondary'}>{payment.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(payment.status)}>{payment.status}</Badge>
            </TableCell>
            <TableCell>{payment.method}</TableCell>
            <TableCell className={`text-right font-medium ${payment.type === 'Incoming' ? 'text-primary' : 'text-destructive'}`}>
              {payment.type === 'Incoming' ? '+' : '-'}${payment.amount.toFixed(2)}
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
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Payment
            </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <PaymentTable filter="all" />
            </TabsContent>
            <TabsContent value="incoming">
              <PaymentTable filter="incoming" />
            </TabsContent>
            <TabsContent value="outgoing">
              <PaymentTable filter="outgoing" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
