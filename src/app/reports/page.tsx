import Header from "@/components/layout/header"
import ReportsDashboard from "@/components/reports/reports-dashboard"

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Reports & Analytics" />
      <main className="flex-1 p-4 md:p-6">
        <ReportsDashboard />
      </main>
    </div>
  )
}
