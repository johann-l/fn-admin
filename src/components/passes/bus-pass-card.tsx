"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bus, MapPin, Calendar, Droplets, Ticket, Printer } from "lucide-react"
import type { BusPass } from "@/lib/data"
import { vehicles } from "@/lib/data"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import QRCode from "react-qr-code"

interface BusPassCardProps {
  pass: BusPass;
}

export default function BusPassCard({ pass }: BusPassCardProps) {
  const vehicle = vehicles.find(v => v.id === pass.vehicleId);
  const qrValue = JSON.stringify({
    passId: pass.id,
    passengerName: pass.passengerName,
    vehicleId: pass.vehicleId,
    validUntil: pass.validUntil.toISOString(),
  });

  return (
    <>
      <style jsx global>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-pass-card, #printable-pass-card * {
              visibility: visible;
            }
            #printable-pass-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            #printable-pass-card .print-card {
              border: none;
              box-shadow: none;
            }
            #printable-pass-card .no-print {
              display: none;
            }
          }
        `}
      </style>
      <div id="printable-pass-card">
        <Card className="w-full max-w-sm font-sans bg-card text-card-foreground shadow-lg rounded-2xl overflow-hidden print-card">
            <div className="bg-primary p-4 relative">
                <div className="flex justify-between items-center text-primary-foreground">
                    <h2 className="text-xl font-bold">FleetNow</h2>
                    <Bus className="h-6 w-6"/>
                </div>
                <div className="absolute -bottom-10 right-6">
                    <Avatar className="h-20 w-20 border-4 border-card bg-card">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${pass.passengerName.charAt(0)}`} alt={pass.passengerName} data-ai-hint="person avatar"/>
                        <AvatarFallback>{pass.passengerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <CardContent className="p-6 pt-12 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="text-left">
                        <h3 className="text-xl font-semibold">{pass.passengerName}</h3>
                        <p className="text-sm text-muted-foreground">Bus Pass</p>
                    </div>
                    <div className="p-1 bg-white rounded-md">
                        <QRCode value={qrValue} size={64} />
                    </div>
                </div>

                <div className="space-y-3 text-sm pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Ticket className="h-4 w-4 mr-2" />Pass ID</span>
                        <span className="font-semibold font-mono text-xs">{pass.id}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Droplets className="h-4 w-4 mr-2" />Blood Group</span>
                        <span className="font-semibold">{pass.bloodGroup}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Bus className="h-4 w-4 mr-2" />Vehicle / Seat</span>
                        <span className="font-semibold">{vehicle?.name} / {pass.seat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><MapPin className="h-4 w-4 mr-2" />Route</span>
                        <span className="font-semibold">{pass.route}</span>
                    </div>
                </div>

                <div className="border-t border-dashed pt-4 mt-4">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" />Valid From</span>
                        <span className="font-semibold">{format(pass.validFrom, "dd MMM, yyyy")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" />Valid Until</span>
                        <span className="font-semibold">{format(pass.validUntil, "dd MMM, yyyy")}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50 no-print">
                 <Button onClick={() => window.print()} className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Export Pass
                </Button>
            </CardFooter>
        </Card>
      </div>
    </>
  );
}
