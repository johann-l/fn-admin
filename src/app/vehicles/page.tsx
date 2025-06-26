import Header from "@/components/layout/header"
import VehicleManagement from "@/components/vehicles/vehicle-management"

export default function FleetPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Fleet Management" />
      <main className="flex-1 p-4 md:p-6">
        <VehicleManagement />
      </main>
    </div>
  )
}
