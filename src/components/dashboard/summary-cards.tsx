import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bus, Clock, Users, AlertCircle } from "lucide-react"
import FuelPriceCard from "./fuel-price-card"

export default function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
          <Bus className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42</div>
          <p className="text-xs text-muted-foreground">out of 45 total buses</p>
        </CardContent>
      </Card>
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">92.1%</div>
          <p className="text-xs text-muted-foreground">+2.5% from last week</p>
        </CardContent>
      </Card>
      <FuelPriceCard />
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">38</div>
          <p className="text-xs text-muted-foreground">4 drivers on standby</p>
        </CardContent>
      </Card>
      <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive transition-transform duration-300 group-hover:scale-125" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">3</div>
          <p className="text-xs text-muted-foreground">1 delay, 2 maintenance requests</p>
        </CardContent>
      </Card>
    </div>
  )
}
