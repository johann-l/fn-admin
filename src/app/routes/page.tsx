
import Header from "@/components/layout/header"
import RouteManagement from "@/components/routes/route-management"

export default function RoutesPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Route Management" />
      <main className="flex-1 p-4 md:p-6">
        <RouteManagement />
      </main>
    </div>
  )
}
