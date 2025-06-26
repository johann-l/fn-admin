"use client"

import * as React from "react"
import { format } from "date-fns"

import { Document } from "@/lib/data"
import { useAppData } from "@/context/app-data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Upload, Download, Trash2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import DocumentPreviewCard from "./document-preview-card"

export default function DocumentManagement() {
  const { documents, vehicles } = useAppData()
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedDocumentForView, setSelectedDocumentForView] = React.useState<Document | null>(null)

  const getStatusVariant = (status: Document["status"]): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Valid': return "default";
      case 'Expiring Soon': return "secondary";
      case 'Expired': return "destructive";
    }
  }

  const handlePreviewClick = (doc: Document) => {
    setSelectedDocumentForView(doc)
    setIsViewDialogOpen(true)
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fleet Documents</CardTitle>
            <CardDescription>Upload and manage vehicle-related documents.</CardDescription>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{vehicles.find(v => v.id === doc.vehicleId)?.name}</TableCell>
                  <TableCell>{format(doc.expiryDate, "LLL dd, y")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(doc.status)}>{doc.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handlePreviewClick(doc)}>
                          <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-sm p-0 bg-transparent border-none shadow-none">
          {selectedDocumentForView && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Document Preview: {selectedDocumentForView.name}</DialogTitle>
                <DialogDescription>
                  Preview of document {selectedDocumentForView.name}.
                </DialogDescription>
              </DialogHeader>
              <DocumentPreviewCard document={selectedDocumentForView} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
