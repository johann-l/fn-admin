"use client"

import * as React from "react"
import { chatContacts, messages as allMessages, Message } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatInterface() {
  const [selectedContactId, setSelectedContactId] = React.useState(chatContacts[0].id)
  const [messages, setMessages] = React.useState<Message[]>(allMessages[chatContacts[0].id] || [])
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId)
    setMessages(allMessages[contactId] || [])
  }
  
  const selectedContact = chatContacts.find(c => c.id === selectedContactId)

  return (
    <div className="h-full flex border-t">
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-9" />
            </div>
        </div>
        <ScrollArea className="flex-1">
          {chatContacts.map(contact => (
            <div
              key={contact.id}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-accent",
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
              <div className="text-xs text-muted-foreground">{contact.lastMessageTime}</div>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="w-2/3 flex flex-col h-full">
        {selectedContact ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-10 w-10">
                  <AvatarImage src={`${selectedContact.avatarUrl}?s=${selectedContact.id}`} alt={selectedContact.name} data-ai-hint="person avatar" />
                  <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{selectedContact.name}</div>
                <div className="text-sm text-muted-foreground">{selectedContact.type}</div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map(message => (
                  <div key={message.id} className={cn("flex items-end gap-3", message.sender === 'Admin' ? 'justify-end' : 'justify-start')}>
                     {message.sender !== 'Admin' && (
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={`${selectedContact.avatarUrl}?m=${message.id}`} alt={selectedContact.name} data-ai-hint="person avatar"/>
                            <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                     )}
                    <div className={cn(
                      "max-w-xs lg:max-w-md rounded-lg px-4 py-2",
                      message.sender === 'Admin' ? 'bg-primary text-primary-foreground' : 'bg-card border'
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 text-right opacity-70">{isMounted ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-card">
              <div className="relative">
                <Input placeholder="Type a message..." className="pr-12" />
                <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
