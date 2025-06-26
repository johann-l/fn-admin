
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Fuel } from "lucide-react"

const fuelData = [
  { name: "Petrol", price: "1.72", unit: "USD/L" },
  { name: "Diesel", price: "1.65", unit: "USD/L" },
  { name: "CNG", price: "0.98", unit: "USD/kg" },
]

export default function FuelPriceCard() {
  const [api, setApi] = React.useState<CarouselApi>()
  
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  React.useEffect(() => {
    if (!api) {
      return
    }
    // event listeners
  }, [api])

  return (
    <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Fuel Prices</CardTitle>
        <Fuel className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125" />
      </CardHeader>
      <CardContent>
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent>
            {fuelData.map((fuel, index) => (
              <CarouselItem key={index}>
                <div className="text-2xl font-bold">${fuel.price}</div>
                <p className="text-xs text-muted-foreground">
                  {fuel.name} ({fuel.unit})
                </p>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  )
}
