import Header from "@/components/layout/header"
import BusPassAdmin from "@/components/passes/bus-pass-admin"

export default function PassesPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Bus Pass Administration" />
      <main className="flex-1 p-4 md:p-6">
        <BusPassAdmin />
      </main>
    </div>
  )
}
