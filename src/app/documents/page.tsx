import Header from "@/components/layout/header"
import DocumentManagement from "@/components/documents/document-management"

export default function DocumentsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Document Management" />
      <main className="flex-1 p-4 md:p-6">
        <DocumentManagement />
      </main>
    </div>
  )
}
