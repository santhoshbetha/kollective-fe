// components/chat/ChatRoom.tsx
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

/*
#Direct Message Channel code to handle real-time message delivery

3. Why this works for Standalone Apps

    Scoped Broadcasts: Messages only go to the specific chat:id channel. Users in other conversations aren't bothered by the data Phoenix.Channel.broadcast/3.
    Preloading: By returning history in the join response, you avoid a separate "flash" of an empty screen before the messages load.
    Automatic Badges: The notify_recipient logic leverages your existing User Feed system, so the red dot updates in real-time even if they are currently browsing the home timeline. 

Summary Checklist

    Register Channel: Add channel "chat:*", KollectiveWeb.ChatChannel to your user_socket.ex.
    Security: The join function verifies the user is a part of the user_one_id/user_two_id pair.
    Real-time: Broadcaster sends the message to the room, while a separate "ping" updates the recipient's global unread count.

*/

export function ChatRoom({ conversationId, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [channel, setChannel] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const chan = socket.channel(`chat:${conversationId}`, {});
    chan.join().receive("ok", ({ messages }) => setMessages(messages));

    chan.on("new_msg", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setChannel(chan);
    return () => chan.leave();
  }, [conversationId]);

  const send = () => {
    if (!text.trim()) return;
    channel.push("new_msg", { content: text });
    setText("");
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <ScrollArea className="flex-1 p-4">
        {messages.map((m) => (
          <div key={m.id} className={`mb-4 flex ${m.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-lg max-w-[70%] ${m.sender_id === currentUser.id ? "bg-blue-600 text-white" : "bg-slate-100"}`}>
              {m.content}
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  );
}
