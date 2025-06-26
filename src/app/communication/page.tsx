import Header from "@/components/layout/header"
import ChatInterface from "@/components/communication/chat-interface"

export default function CommunicationPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Parent & Driver Communication" />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  )
}
