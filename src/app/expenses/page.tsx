import Header from "@/components/layout/header"
import ExpenseTracker from "@/components/expenses/expense-tracker"

export default function ExpensesPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Expense Management" />
      <main className="flex-1 p-4 md:p-6">
        <ExpenseTracker />
      </main>
    </div>
  )
}
