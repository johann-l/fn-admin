import Header from "@/components/layout/header"
import DriverManagement from "@/components/drivers/driver-management"

export default function DriversPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Driver Management" />
      <main className="flex-1 p-4 md:p-6">
        <DriverManagement />
      </main>
    </div>
  )
}
