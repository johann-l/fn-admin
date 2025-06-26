"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bus, Phone, ShieldCheck, User, Printer, Mail } from "lucide-react"
import type { Driver } from "@/lib/data"
import { vehicles } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import QRCode from "react-qr-code"

interface DriverIdCardProps {
  driver: Driver;
}

export default function DriverIdCard({ driver }: DriverIdCardProps) {
  const vehicle = vehicles.find(v => v.id === driver.assignedVehicleId);
  const qrValue = JSON.stringify({
    driverId: driver.id,
    name: driver.name,
    assignedVehicleId: driver.assignedVehicleId,
  });

  return (
    <>
      <style jsx global>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-driver-card, #printable-driver-card * {
              visibility: visible;
            }
            #printable-driver-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            #printable-driver-card .print-card {
              border: none;
              box-shadow: none;
            }
            #printable-driver-card .no-print {
              display: none;
            }
          }
        `}
      </style>
      <div id="printable-driver-card">
        <Card className="w-full max-w-sm font-sans bg-card text-card-foreground shadow-lg rounded-2xl overflow-hidden print-card">
            <div className="bg-primary p-4 relative">
                <div className="flex justify-between items-center text-primary-foreground">
                    <h2 className="text-xl font-bold">FleetNow</h2>
                    <ShieldCheck className="h-6 w-6"/>
                </div>
                <div className="absolute -bottom-10 right-6">
                    <Avatar className="h-20 w-20 border-4 border-card bg-card">
                        <AvatarImage src={`${driver.avatarUrl}?d=${driver.id}`} alt={driver.name} data-ai-hint="person avatar"/>
                        <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <CardContent className="p-6 pt-12 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="text-left">
                        <h3 className="text-xl font-semibold">{driver.name}</h3>
                        <p className="text-sm text-muted-foreground">Official Driver ID</p>
                    </div>
                    <div className="p-1 bg-white rounded-md">
                        <QRCode value={qrValue} size={64} />
                    </div>
                </div>

                <div className="space-y-3 text-sm pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><User className="h-4 w-4 mr-2" />Driver ID</span>
                        <span className="font-semibold font-mono text-xs">{driver.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Mail className="h-4 w-4 mr-2" />Email</span>
                        <span className="font-semibold">{driver.email}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Phone className="h-4 w-4 mr-2" />Phone</span>
                        <span className="font-semibold">{driver.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Bus className="h-4 w-4 mr-2" />Assigned Vehicle</span>
                        <span className="font-semibold">{vehicle?.name || 'N/A'}</span>
                    </div>
                </div>
                 <div className="border-t border-dashed pt-4 mt-4 text-center">
                    <p className="text-xs text-muted-foreground">This card is the property of FleetNow. If found, please return to our main office.</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50 no-print">
                 <Button onClick={() => window.print()} className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Export ID
                </Button>
            </CardFooter>
        </Card>
      </div>
    </>
  );
}
