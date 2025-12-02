"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Send } from "lucide-react";

// Supabase client ONLY for chat database
const supabase = createClient(
  "https://ltdxlajzilbvmipcuqxd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHhsYWp6aWxidm1pcGN1cXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTQxMDEsImV4cCI6MjA3MDMzMDEwMX0.si0smbCAHPa7w9qbhzErQpo8rWJ7_vyZWPYXyJrHzBE"
);

const REGISTERED_ROUTE_ID = "11111111-1111-1111-1111-111111111111";

type Message = {
  id: number;
  chatroom_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  users: { name: string } | null;
};

export default function ChatRoom() {
  const [userId, setUserId] = useState<string | null>(null);
  const [chatroomId, setChatroomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* Load user details */
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (id) setUserId(id);
  }, []);

  /* Ensure chatroom exists */
  useEffect(() => {
    if (!userId) return;

    async function ensureChatroom() {
      let { data: chatroom } = await supabase
        .from("chatrooms")
        .select("id")
        .eq("route_id", REGISTERED_ROUTE_ID)
        .single();

      if (!chatroom) {
        const { data } = await supabase
          .from("chatrooms")
          .insert([{ route_id: REGISTERED_ROUTE_ID }])
          .select("id")
          .single();
        chatroom = data;
      }

      setChatroomId(chatroom.id);

      const { data: member } = await supabase
        .from("chatroom_members")
        .select("id")
        .eq("chatroom_id", chatroom.id)
        .eq("user_id", userId)
        .single();

      if (!member) {
        await supabase
          .from("chatroom_members")
          .insert([{ chatroom_id: chatroom.id, user_id: userId }]);
      }
    }

    ensureChatroom();
  }, [userId]);

  /* Fetch + subscribe to messages */
  useEffect(() => {
    if (!chatroomId) return;

    async function fetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select(
          `
    id,
    chatroom_id,
    sender_id,
    message_text,
    created_at,
    users(name)
  `
        )
        .eq("chatroom_id", chatroomId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    }

    fetchMessages();

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chatroom_id=eq.${chatroomId}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatroomId]);

  /* Auto-scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Send message */
  async function sendMessage() {
    if (!chatroomId || !userId || !newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        chatroom_id: chatroomId,
        sender_id: userId,
        message_text: newMessage.trim(),
      },
    ]);

    if (!error) setNewMessage("");
  }

  // --- Helper Functions for Grouping ---

  function isSameDay(date1: string, date2: string) {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  }

  function getDayLabel(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((msg, index) => {
          const mine = msg.sender_id === userId;
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];

          // 1. Logic: Should we show the Date Header?
          const showDateHeader =
            index === 0 || !isSameDay(msg.created_at, prevMsg.created_at);

          // 2. Logic: Is this message part of a sequence from the same user?
          const isSequence =
            !showDateHeader && prevMsg && prevMsg.sender_id === msg.sender_id;

          // 3. Logic: Is this the LAST message in that sequence? (For the tail)
          const isLastInSequence =
            !nextMsg ||
            nextMsg.sender_id !== msg.sender_id ||
            !isSameDay(msg.created_at, nextMsg.created_at);

          return (
            <div key={msg.id} className="flex flex-col">
              {/* --- Date Divider --- */}
              {showDateHeader && (
                <div className="flex justify-center my-6 sticky top-2 z-10">
                  <span className="text-[11px] font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border opacity-80 backdrop-blur-sm">
                    {getDayLabel(msg.created_at)}
                  </span>
                </div>
              )}

              {/* --- Message Block --- */}
              <div
                className={`flex w-full ${
                  mine ? "justify-end" : "justify-start"
                } ${isSequence ? "mt-1" : "mt-4"}`} // Tighter spacing if sequence
              >
                <div
                  className={`flex flex-col max-w-[70%] ${
                    mine ? "items-end" : "items-start"
                  }`}
                >
                  {/* Sender name: Only show if NOT mine AND it's the start of a sequence */}
                  {!mine && !isSequence && (
                    <span className="text-xs font-medium text-primary mb-1 px-1">
                      {msg.users?.name || "Unknown"}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                    className={`relative px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground border"
                    } ${
                      // Dynamic Border Radius for "Stacked" look
                      // If it is NOT the last in sequence, remove the "tail" (sm radius) and make it round (2xl)
                      mine
                        ? `rounded-l-2xl rounded-tr-2xl ${
                            isLastInSequence
                              ? "rounded-br-sm"
                              : "rounded-br-2xl"
                          }`
                        : `rounded-r-2xl rounded-tl-2xl ${
                            isLastInSequence
                              ? "rounded-bl-sm"
                              : "rounded-bl-2xl"
                          }`
                    }`}
                  >
                    <p className="pr-12">{msg.message_text}</p>

                    <span className="absolute bottom-1 right-2 text-[10px] opacity-60">
                      {new Date(msg.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-3 max-w-5xl mx-auto">
          <input
            type="text"
            className="flex-1 bg-background border border-input rounded-lg px-4 py-2.5 text-sm"
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
