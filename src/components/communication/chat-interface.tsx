"use client"

import * as React from "react"
import { chatContacts, messages as allMessages, Message } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Search, Send, MoreVertical, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ChatInterface() {
  const [selectedContactId, setSelectedContactId] = React.useState(chatContacts[0].id)
  const [messages, setMessages] = React.useState<Message[]>(allMessages[chatContacts[0].id] || [])
  const [isMounted, setIsMounted] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = React.useState<'list' | 'chat'>('list');

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    // Scroll to bottom of chat on new message
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId)
    setMessages(allMessages[contactId] || [])
    if (isMobile) {
      setMobileView('chat');
    }
  }
  
  const selectedContact = chatContacts.find(c => c.id === selectedContactId)

  return (
    <Card className="h-full flex overflow-hidden">
        {/* Contact List */}
        <div className={cn(
            "w-full md:w-1/3 border-r flex-col bg-muted/50",
            isMobile && mobileView === 'chat' ? 'hidden' : 'flex'
        )}>
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search contacts..." className="pl-9 bg-background" />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {chatContacts.map(contact => (
                        <button
                        key={contact.id}
                        className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent text-left w-full",
                            selectedContactId === contact.id && "bg-accent"
                        )}
                        onClick={() => handleContactSelect(contact.id)}
                        >
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={`${contact.avatarUrl}?c=${contact.id}`} alt={contact.name} data-ai-hint="person avatar" />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <div className="font-semibold truncate">{contact.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{contact.lastMessage}</div>
                        </div>
                        <div className="text-xs text-muted-foreground self-start pt-1">{contact.lastMessageTime}</div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className={cn(
            "w-full md:w-2/3 flex-col h-full",
            isMobile && mobileView === 'list' ? 'hidden' : 'flex'
        )}>
            {selectedContact ? (
            <>
                <div className="p-3 border-b flex items-center gap-2">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={() => setMobileView('list')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`${selectedContact.avatarUrl}?s=${selectedContact.id}`} alt={selectedContact.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-bold">{selectedContact.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedContact.type}</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4 sm:p-6" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map(message => (
                            <div key={message.id} className={cn("flex items-end gap-3 w-full", message.sender === 'Admin' ? 'justify-end' : 'justify-start')}>
                                {message.sender !== 'Admin' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`${selectedContact.avatarUrl}?m=${message.id}`} alt={selectedContact.name} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                "max-w-xs lg:max-w-md px-4 py-2.5 rounded-xl",
                                message.sender === 'Admin' 
                                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                                    : 'bg-muted rounded-bl-none'
                                )}>
                                <p className="text-sm break-words">{message.content}</p>
                                <p className="text-xs mt-1.5 text-right opacity-70">{isMounted ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-4 border-t bg-background">
                    <form className="relative" onSubmit={(e) => e.preventDefault()}>
                        <Input placeholder="Type a message..." className="pr-12 h-10" />
                        <Button size="icon" type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </>
            ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a contact to start messaging
            </div>
            )}
        </div>
    </Card>
  )
}
