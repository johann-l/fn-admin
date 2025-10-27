import Header from "@/components/layout/header"
import PaymentManagement from "@/components/payments/payment-management"
import { Suspense } from "react"
import PaymentStatusHandler from "@/components/payments/payment-status-handler"

export default function PaymentsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Payment Management" />
      <main className="flex-1 p-4 md:p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <PaymentStatusHandler />
        </Suspense>
        <PaymentManagement />
      </main>
    </div>
  )
}
