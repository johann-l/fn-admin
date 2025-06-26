import Header from "@/components/layout/header"
import ChatInterface from "@/components/communication/chat-interface"

export default function CommunicationPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.4))] md:h-full bg-background">
      <Header title="Real-Time Communication" />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  )
}
