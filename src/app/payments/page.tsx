import Header from "@/components/layout/header"
import PaymentManagement from "@/components/payments/payment-management"

export default function PaymentsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Payment Management" />
      <main className="flex-1 p-4 md:p-6">
        <PaymentManagement />
      </main>
    </div>
  )
}
