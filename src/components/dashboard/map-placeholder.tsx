"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MapPin, Bus } from "lucide-react"

import { useAppData } from "@/context/app-data-context"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function MapPlaceholder() {
  const { vehicles } = useAppData()
  const mapRef = React.useRef<HTMLDivElement>(null)
  
  const [positions, setPositions] = React.useState<Map<string, { x: number; y: number }>>(new Map())
  const isInitialized = React.useRef(false)

  React.useEffect(() => {
    const updatePositions = () => {
      if (mapRef.current) {
        const { width, height } = mapRef.current.getBoundingClientRect()
        if (width === 0 || height === 0) return;

        setPositions(prevPositions => {
          const newPositions = new Map(prevPositions)
          
          vehicles.forEach(vehicle => {
            if (vehicle.status !== 'Out of Service' && vehicle.status !== 'Maintenance') {
              const currentPos = newPositions.get(vehicle.id)

              if (!currentPos || !isInitialized.current) {
                newPositions.set(vehicle.id, {
                  x: Math.random() * (width - 40) + 20,
                  y: Math.random() * (height - 40) + 20,
                })
              } else {
                const moveX = (Math.random() - 0.5) * 50
                const moveY = (Math.random() - 0.5) * 50
                
                let newX = currentPos.x + moveX
                let newY = currentPos.y + moveY

                if (newX < 20) newX = 20
                if (newX > width - 20) newX = width - 20
                if (newY < 20) newY = 20
                if (newY > height - 20) newY = height - 20
                
                newPositions.set(vehicle.id, { x: newX, y: newY })
              }
            } else {
              newPositions.delete(vehicle.id);
            }
          })

          if (!isInitialized.current) {
            isInitialized.current = true;
          }
          return newPositions
        })
      }
    }

    updatePositions();
    const interval = setInterval(updatePositions, 3000)

    return () => clearInterval(interval)
  }, [vehicles])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return "bg-primary";
      case 'Delayed': return "bg-destructive";
      case 'Early': return "bg-yellow-500";
      default: return "bg-gray-400";
    }
  }
  
  const activeVehicles = vehicles.filter(v => v.status !== 'Out of Service' && v.status !== 'Maintenance');

  return (
    <Card className="h-[400px] lg:h-[calc(100vh-250px)]">
      <CardContent className="p-0 h-full">
        <div ref={mapRef} className="h-full w-full bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {activeVehicles.length === 0 ? (
            <div className="text-center text-muted-foreground z-0">
              <MapPin className="h-12 w-12 mx-auto" />
              <p className="mt-2 font-medium">Live Map View</p>
              <p className="text-sm">No active buses to display.</p>
            </div>
          ) : (
            <TooltipProvider>
              {activeVehicles.map(vehicle => {
                const position = positions.get(vehicle.id)
                if (!position) return null

                return (
                  <Tooltip key={vehicle.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="absolute flex items-center justify-center cursor-pointer"
                        initial={{ x: position.x, y: position.y, scale: 0 }}
                        animate={{ x: position.x, y: position.y, scale: 1 }}
                        transition={{ 
                            x: { duration: 3, ease: "linear" },
                            y: { duration: 3, ease: "linear" },
                            scale: { duration: 0.3, ease: "easeOut" }
                        }}
                        style={{ transform: `translate(-50%, -50%)`}}
                      >
                        <div className={cn("relative w-5 h-5 rounded-full flex items-center justify-center", getStatusColor(vehicle.status))}>
                          <Bus className="h-3 w-3 text-primary-foreground" />
                          <div className={cn(
                            "absolute top-0 left-0 h-full w-full rounded-full animate-ping opacity-75",
                             getStatusColor(vehicle.status)
                          )} />
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{vehicle.name}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.route ? `Route ${vehicle.route}` : 'Unassigned'}</p>
                      <p className="text-sm flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full inline-block", getStatusColor(vehicle.status))}></span>
                          {vehicle.status}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
