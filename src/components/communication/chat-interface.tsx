
"use client"

import * as React from "react"
import { chatContacts, messages as allMessages, Message } from "@/lib/data"
import { useAppData } from "@/context/app-data-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Send, MoreVertical, ArrowLeft, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ChatInterface() {
  const { drivers } = useAppData()
  
  const [selectedContactId, setSelectedContactId] = React.useState(chatContacts[0].id)
  const [messages, setMessages] = React.useState<Message[]>(allMessages[chatContacts[0].id] || [])
  const [isMounted, setIsMounted] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = React.useState<'list' | 'chat'>('list');

  const driverContact = chatContacts.find(c => c.id === 'group_drivers');
  const passengerGroupChats = chatContacts.filter(c => c.type === 'Group' && c.route);


  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, selectedContactId]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId)
    setMessages(allMessages[contactId] || [])
    if (isMobile) {
      setMobileView('chat');
    }
  }
  
  const selectedContact = chatContacts.find(c => c.id === selectedContactId)

  const ContactButton = ({ contact }: { contact: typeof chatContacts[0] }) => (
    <button
        key={contact.id}
        className={cn(
            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent text-left w-full",
            selectedContactId === contact.id && "bg-accent"
        )}
        onClick={() => handleContactSelect(contact.id)}
        >
        <Avatar className="h-10 w-10">
            {contact.type === 'Group' ? (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    <Users className="h-5 w-5" />
                </div>
            ) : (
                <>
                    <AvatarImage src={`${contact.avatarUrl}?c=${contact.id}`} alt={contact.name} data-ai-hint="person avatar" />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </>
            )}
        </Avatar>
        <div className="flex-1 overflow-hidden">
            <div className="font-semibold truncate">{contact.name}</div>
            <div className="text-sm text-muted-foreground truncate">{contact.lastMessage}</div>
        </div>
        <div className="text-xs text-muted-foreground self-start pt-1">{contact.lastMessageTime}</div>
    </button>
  )

  return (
    <Card className="h-full flex overflow-hidden">
        {/* Contact List */}
        <div className={cn(
            "w-full md:w-1/3 border-r flex-col bg-muted/50",
            isMobile && mobileView === 'chat' ? 'hidden' : 'flex'
        )}>
            <Tabs defaultValue="drivers" className="flex flex-col h-full">
                <div className="p-4 border-b">
                     <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="drivers">Drivers</TabsTrigger>
                        <TabsTrigger value="passengers">Passengers</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="drivers" className="flex-1 overflow-auto">
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-1">
                            {driverContact && <ContactButton contact={driverContact} />}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="passengers" className="flex-1 overflow-auto">
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-1">
                            {passengerGroupChats.map(contact => (
                                <ContactButton key={contact.id} contact={contact} />
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>

        {/* Chat Window */}
        <div className={cn(
            "w-full md:w-2/3 flex-col h-full",
            isMobile && mobileView === 'list' ? 'hidden' : 'flex'
        )}>
          <TooltipProvider>
            {selectedContact ? (
            <>
                <div className="p-3 border-b flex items-center gap-2">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={() => setMobileView('list')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar className="h-10 w-10">
                       {selectedContact.type === 'Group' ? (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                <Users className="h-5 w-5" />
                            </div>
                        ) : (
                            <>
                                <AvatarImage src={`${selectedContact.avatarUrl}?s=${selectedContact.id}`} alt={selectedContact.name} data-ai-hint="person avatar" />
                                <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-bold">{selectedContact.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedContact.type === 'Group' ? 'Group Chat' : selectedContact.type}</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>More Options</p>
                          </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4 sm:p-6" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map(message => {
                                const isGroupChat = selectedContact?.type === 'Group';
                                const senderIsAdmin = message.sender === 'Admin';
                                let senderName = selectedContact.name;
                                let senderAvatarUrl = selectedContact.avatarUrl;
                                let fallback = senderName.charAt(0);

                                if (isGroupChat && !senderIsAdmin) {
                                  senderName = message.sender;
                                  fallback = senderName.charAt(0);
                                  const senderDriver = drivers.find(d => d.name === message.sender);
                                  if (senderDriver) {
                                    senderAvatarUrl = senderDriver.avatarUrl;
                                  } else {
                                    // It's a student/parent
                                    senderAvatarUrl = `https://placehold.co/100x100.png?text=${fallback}`;
                                  }
                                }

                                return (
                                <div key={message.id} className={cn("flex items-end gap-3 w-full", senderIsAdmin ? 'justify-end' : 'justify-start')}>
                                    {!senderIsAdmin && (
                                        <Avatar className="h-8 w-8 self-end">
                                            <AvatarImage src={`${senderAvatarUrl}?m=${message.id}`} alt={senderName} data-ai-hint="person avatar"/>
                                            <AvatarFallback>{fallback}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                    "max-w-xs lg:max-w-md px-4 py-2.5 rounded-xl",
                                    senderIsAdmin 
                                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                                        : 'bg-muted rounded-bl-none'
                                    )}>
                                    {isGroupChat && !senderIsAdmin && <p className="text-xs font-bold mb-1 text-accent-foreground/80">{senderName}</p>}
                                    <p className="text-sm break-words">{message.content}</p>
                                    <p className="text-xs mt-1.5 text-right opacity-70">{isMounted ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-4 border-t bg-background">
                    <form className="relative" onSubmit={(e) => e.preventDefault()}>
                        <Input placeholder="Type a message..." className="pr-12 h-10" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                                <Send className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Send Message</p>
                          </TooltipContent>
                        </Tooltip>
                    </form>
                </div>
            </>
            ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
            </div>
            )}
            </TooltipProvider>
        </div>
    </Card>
  )
}
