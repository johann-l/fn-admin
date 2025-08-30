"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Message = {
  id: number;
  chatroom_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  sender?: { name: string };
};

const userId =
  typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
const REGISTERED_ROUTE_ID = "11111111-1111-1111-1111-111111111111";

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatroomId, setChatroomId] = useState<string | null>(null);

  // 1. Fetch existing chatroom for this route
  useEffect(() => {
    async function fetchChatroom() {
      const { data: chatroom, error } = await supabase
        .from("chatrooms")
        .select("id")
        .eq("route_id", REGISTERED_ROUTE_ID)
        .single();

      if (error) {
        console.error("Error fetching chatroom:", error);
        return;
      }

      if (chatroom) {
        setChatroomId(chatroom.id);
      }
    }

    fetchChatroom();
  }, []);

  // 2. Fetch messages for that chatroom
  useEffect(() => {
    if (!chatroomId) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:users(name)")
        .eq("chatroom_id", chatroomId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
    }

    fetchMessages();

    // 3. Subscribe to new messages in realtime
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatroomId]);

  // 4. Send message (only if chatroom exists)
  async function sendMessage() {
    if (!chatroomId || !newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        chatroom_id: chatroomId,
        sender_id: userId,
        message_text: newMessage,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setNewMessage("");
  }

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${
              msg.sender_id === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow ${
                msg.sender_id === userId
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.message_text}</p>
              <p className="text-[10px] opacity-70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="p-4 bg-white border-t flex">
        <input
          type="text"
          className="flex-1 border rounded-xl px-3 py-2 mr-2"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
}
