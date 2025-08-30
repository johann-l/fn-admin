import Header from "@/components/layout/header";
import MapPlaceholder from "@/components/dashboard/map-placeholder";
import FleetStatusTable from "@/components/dashboard/fleet-status-table";
import SummaryCards from "@/components/dashboard/summary-cards";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Live Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <SummaryCards />
        <div className="grid gap-6 grid-cols-1">
          <MapPlaceholder />
          <FleetStatusTable />
        </div>
      </main>
    </div>
  );
}
