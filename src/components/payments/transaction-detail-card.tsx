
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, Calendar, CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react"
import type { Payment } from "@/lib/data"
import { format } from "date-fns"
import { Banknote as BanknoteIcon } from "lucide-react"


interface TransactionDetailCardProps {
  payment: Payment;
}

export default function TransactionDetailCard({ payment }: TransactionDetailCardProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const getStatusIcon = (status: Payment["status"]) => {
    switch(status) {
        case 'Paid': return <CheckCircle2 className="h-4 w-4 text-primary" />;
        case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'Failed': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  }

  return (
    <Card className="w-full max-w-sm font-sans bg-card text-card-foreground shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/50 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-lg">Transaction Details</CardTitle>
                    <CardDescription>ID: {payment.id}</CardDescription>
                </div>
                {payment.type === 'Incoming' ? 
                    <ArrowUpRight className="h-6 w-6 text-primary" /> : 
                    <ArrowDownLeft className="h-6 w-6 text-destructive" />
                }
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
            <div className="text-center pb-4 border-b border-dashed">
                <p className="text-sm text-muted-foreground">{payment.description}</p>
                <p className={`text-4xl font-bold mt-1 ${payment.type === 'Incoming' ? 'text-primary' : 'text-destructive'}`}>
                    {payment.type === 'Incoming' ? '+' : '-'}${payment.amount.toFixed(2)}
                </p>
            </div>

            <div className="space-y-3 text-sm pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" />Date & Time</span>
                    <span className="font-semibold">{isMounted ? format(payment.date, "PPpp") : '...'}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center">{getStatusIcon(payment.status)}<span className="ml-2">Status</span></span>
                    <span className="font-semibold">{payment.status}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center">
                        {payment.method === 'Credit Card' ? <CreditCard className="h-4 w-4 mr-2" /> : <BanknoteIcon className="h-4 w-4 mr-2" />}
                        Payment Method
                    </span>
                    <span className="font-semibold">{payment.method}</span>
                </div>
            </div>
             <div className="border-t border-dashed pt-4 mt-4 text-center">
                <p className="text-xs text-muted-foreground">FleetNow Transaction Record</p>
            </div>
        </CardContent>
    </Card>
  );
}
