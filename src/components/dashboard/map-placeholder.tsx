import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function MapPlaceholder() {
  return (
    <Card className="h-[400px] lg:h-[calc(100vh-250px)]">
      <CardContent className="p-0 h-full">
        <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto" />
            <p className="mt-2 font-medium">Live Map View</p>
            <p className="text-sm">Real-time bus locations will be displayed here.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
