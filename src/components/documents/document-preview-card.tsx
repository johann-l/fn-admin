"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, AlertCircle, Download, ShieldCheck } from "lucide-react"
import type { Document } from "@/lib/data"
import { useAppData } from "@/context/app-data-context"
import { format } from "date-fns"

interface DocumentPreviewCardProps {
  document: Document;
}

export default function DocumentPreviewCard({ document }: DocumentPreviewCardProps) {
  const { vehicles } = useAppData()
  const vehicle = vehicles.find(v => v.id === document.vehicleId)

  return (
    <Card className="w-full max-w-sm font-sans bg-card text-card-foreground shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/50 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Document Preview</CardTitle>
                    <CardDescription>ID: {document.id}</CardDescription>
                </div>
                 <ShieldCheck className="h-6 w-6 text-muted-foreground"/>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
            <div className="text-center pb-4 border-b border-dashed">
                <p className="text-2xl font-semibold mt-1">
                    {document.name}
                </p>
                <p className="text-sm text-muted-foreground">For Vehicle: {vehicle?.name || 'N/A'}</p>
            </div>

            <div className="space-y-3 text-sm pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" />Upload Date</span>
                    <span className="font-semibold">{format(document.uploadDate, "PP")}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" />Expiry Date</span>
                    <span className="font-semibold">{format(document.expiryDate, "PP")}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><AlertCircle className="h-4 w-4 mr-2" />Status</span>
                    <span className="font-semibold">{document.status}</span>
                </div>
            </div>
        </CardContent>
         <CardFooter className="p-4 bg-muted/50">
             <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Document
            </Button>
        </CardFooter>
    </Card>
  )
}
