import Header from "@/components/layout/header"
import VehicleManagement from "@/components/vehicles/vehicle-management"

export default function VehiclesPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Vehicle Management" />
      <main className="flex-1 p-4 md:p-6">
        <VehicleManagement />
      </main>
    </div>
  )
}
