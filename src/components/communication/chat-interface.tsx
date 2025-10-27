"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔹 Supabase client
const supabase = createClient(
  "https://ltdxlajzilbvmipcuqxd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHhsYWp6aWxidm1pcGN1cXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTQxMDEsImV4cCI6MjA3MDMzMDEwMX0.si0smbCAHPa7w9qbhzErQpo8rWJ7_vyZWPYXyJrHzBE"
);

// 🔹 Constants
const REGISTERED_ROUTE_ID = "11111111-1111-1111-1111-111111111111";

type Message = {
  id: number;
  chatroom_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  sender?: { name: string };
};

export default function ChatRoom() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("You");
  const [chatroomId, setChatroomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 🔹 Step 1: Ensure user exists
  useEffect(() => {
    async function ensureUser() {
      try {
        const storedUserId = localStorage.getItem("user_id");
        const storedEmail = localStorage.getItem("email");

        // ✅ Case 1: Already stored user
        if (storedUserId && storedEmail) {
          setUserId(storedUserId);
          setUserEmail(storedEmail);

          const { data: userData, error: nameError } = await supabase
            .from("users")
            .select("name")
            .eq("id", storedUserId)
            .maybeSingle(); // use maybeSingle to avoid throwing if none

          if (nameError)
            console.warn("⚠️ Could not fetch username:", nameError);
          if (userData?.name) setUserName(userData.name);
          return;
        }

        // ✅ Case 2: Login email provided
        const emailFromLogin = localStorage.getItem("login_email");
        if (emailFromLogin) {
          setUserEmail(emailFromLogin);

          // Check if user exists
          const { data: existingUser, error: checkErr } = await supabase
            .from("users")
            .select("id, name")
            .eq("email", emailFromLogin)
            .maybeSingle();

          if (checkErr) console.warn("⚠️ Error checking user:", checkErr);

          if (existingUser) {
            localStorage.setItem("user_id", existingUser.id);
            localStorage.setItem("email", emailFromLogin);
            setUserId(existingUser.id);
            setUserName(existingUser.name);
            return;
          }

          // Otherwise create new user
          const randomName = emailFromLogin.split("@")[0];
          const { data: newUser, error: createErr } = await supabase
            .from("users")
            .insert([{ name: randomName, email: emailFromLogin }])
            .select("id, name")
            .single();

          if (createErr) {
            console.error("❌ Error creating user:", createErr);
            return;
          }

          localStorage.setItem("user_id", newUser.id);
          localStorage.setItem("email", emailFromLogin);
          setUserId(newUser.id);
          setUserName(newUser.name);
          return;
        }

        // ✅ Case 3: No email found — fallback guest
        const randomName = `Guest-${Math.floor(Math.random() * 1000)}`;
        const { data: guest, error: guestErr } = await supabase
          .from("users")
          .insert([{ name: randomName, email: `${randomName}@guest.com` }])
          .select("id, name, email")
          .single();

        if (guestErr) {
          console.error("❌ Error creating guest user:", guestErr);
          return;
        }

        localStorage.setItem("user_id", guest.id);
        localStorage.setItem("email", guest.email);
        setUserId(guest.id);
        setUserEmail(guest.email);
        setUserName(guest.name);
      } catch (err) {
        console.error("💥 Unexpected error in ensureUser():", err);
      }
    }

    ensureUser();
  }, []);

  // 🔹 Step 2: Ensure chatroom exists for the route
  useEffect(() => {
    if (!userId) return;

    async function ensureChatroom() {
      let { data: chatroom, error } = await supabase
        .from("chatrooms")
        .select("id")
        .eq("route_id", REGISTERED_ROUTE_ID)
        .single();

      if (error || !chatroom) {
        const insertRes = await supabase
          .from("chatrooms")
          .insert([{ route_id: REGISTERED_ROUTE_ID }])
          .select("id")
          .single();
        if (insertRes.data) chatroom = insertRes.data;
      }

      if (!chatroom) {
        console.error("❌ Could not create or fetch chatroom");
        return;
      }

      setChatroomId(chatroom.id);

      // 🔹 Step 3: Ensure user is in chatroom_members
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

  // 🔹 Step 4: Fetch + subscribe to messages
  useEffect(() => {
    if (!chatroomId) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:users(name)")
        .eq("chatroom_id", chatroomId)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatroomId]);

  // 🔹 Step 5: Send message
  async function sendMessage() {
    if (!chatroomId || !userId || !newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        chatroom_id: chatroomId,
        sender_id: userId,
        message_text: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error("❌ Error sending message:", error);
      return;
    }

    setNewMessage("");
  }

  // 🔹 Step 6: UI
  return (
    <div className="flex flex-col h-full w-full">
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
              className={`px-4 py-2 rounded-2xl shadow max-w-[70%] ${
                msg.sender_id === userId
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              {/* Sender name */}
              {msg.sender_id !== userId && (
                <p className="text-[11px] font-semibold text-green-600 mb-1">
                  {msg.sender?.name || "Unknown"}
                </p>
              )}
              <p className="text-sm break-words">{msg.message_text}</p>
              <p className="text-[10px] opacity-70 mt-1 text-right">
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
