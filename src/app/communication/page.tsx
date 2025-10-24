import Header from "@/components/layout/header";
import ChatInterface from "@/components/communication/chat-interface";
export default function CommunicationPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header title="Communication Hub" />
      {/* Make ChatInterface fill remaining space */}
      <main className="flex-1 flex overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
