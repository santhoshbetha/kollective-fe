import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { MessageCircle, Send, Smile, Paperclip, Search, Phone, Video, Info, ImageIcon, File, X, Users, ArrowLeft, User, Settings } from "lucide-react"

const mockConversations = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "/professional-woman-diverse.png",
    lastMessage: "That sounds great! Let's schedule a call.",
    timestamp: "2m ago",
    unread: 2,
    isOnline: true,
    isGroup: false,
  },
  {
    id: 2,
    name: "Tech Innovators Group",
    avatar: "/tech-group-icon.jpg",
    lastMessage: "John: The new feature is ready for review",
    timestamp: "15m ago",
    unread: 5,
    isOnline: false,
    isGroup: true,
    members: ["John", "Sarah", "Mike", "You"],
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    avatar: "/professional-man.jpg",
    lastMessage: "Thanks for the feedback!",
    timestamp: "1h ago",
    unread: 0,
    isOnline: true,
    isGroup: false,
  },
  {
    id: 4,
    name: "Design Team",
    avatar: "/design-team-icon.jpg",
    lastMessage: "You: I'll share the mockups tomorrow",
    timestamp: "3h ago",
    unread: 0,
    isOnline: false,
    isGroup: true,
    members: ["Emma", "David", "Lisa", "You"],
  },
  {
    id: 5,
    name: "Dr. Emily Watson",
    avatar: "/doctor-woman.png",
    lastMessage: "The research paper looks promising",
    timestamp: "Yesterday",
    unread: 0,
    isOnline: false,
    isGroup: false,
  },
  {
    id: 6,
    name: "Startup Founders",
    avatar: "/startup-icon.jpg",
    lastMessage: "Alex: Anyone free for coffee this week?",
    timestamp: "Yesterday",
    unread: 1,
    isOnline: false,
    isGroup: true,
    members: ["Alex", "Rachel", "Tom", "You"],
  },
]

const mockMessages = {
  1: [
    {
      id: 1,
      senderId: "sarah",
      senderName: "Sarah Chen",
      content: "Hi! I saw your post about the quantum computing project. Very interesting!",
      timestamp: "10:30 AM",
      isOwn: false,
      type: "text",
    },
    {
      id: 2,
      senderId: "you",
      senderName: "You",
      content: "Thanks! I've been working on it for months. Would love to discuss it further.",
      timestamp: "10:32 AM",
      isOwn: true,
      type: "text",
    },
    {
      id: 3,
      senderId: "sarah",
      senderName: "Sarah Chen",
      content: "Here's the research paper I mentioned",
      timestamp: "10:33 AM",
      isOwn: false,
      type: "file",
      fileName: "quantum-research-2024.pdf",
    },
    {
      id: 4,
      senderId: "you",
      senderName: "You",
      content: "Perfect! I'll review it and get back to you.",
      timestamp: "10:35 AM",
      isOwn: true,
      type: "text",
    },
    {
      id: 5,
      senderId: "sarah",
      senderName: "Sarah Chen",
      content: "That sounds great! Let's schedule a call.",
      timestamp: "10:36 AM",
      isOwn: false,
      type: "text",
    },
  ],
  2: [
    {
      id: 1,
      senderId: "john",
      senderName: "John Smith",
      content: "Hey team! Just pushed the latest updates to the repo.",
      timestamp: "9:15 AM",
      isOwn: false,
      type: "text",
    },
    {
      id: 2,
      senderId: "mike",
      senderName: "Mike Johnson",
      content: "Great work! I'll test it this afternoon.",
      timestamp: "9:20 AM",
      isOwn: false,
      type: "text",
    },
    {
      id: 3,
      senderId: "you",
      senderName: "You",
      content: "Looking good! Here's a screenshot of the new UI",
      timestamp: "9:25 AM",
      isOwn: true,
      type: "image",
      fileUrl: "/modern-app-interface.png",
    },
    {
      id: 4,
      senderId: "john",
      senderName: "John Smith",
      content: "The new feature is ready for review",
      timestamp: "9:45 AM",
      isOwn: false,
      type: "text",
    },
  ],
}

export default function ChatsPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showConversationList, setShowConversationList] = useState(true)

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const currentConversation = mockConversations.find((c) => c.id === selectedConversation)
  const currentMessages = mockMessages[selectedConversation] || []

  return (
    <Layout.Main>
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm h-[calc(100vh-120px)]">
          <div className="flex h-full">
            {/* Conversation List Sidebar */}
            <div className={`${showConversationList ? "flex" : "hidden"} md:flex flex-col w-full md:w-96 border-r border-primary/10`}>
              {/* Search Header */}
              <div className="p-6 border-b border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Conversations
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/20 hover:bg-primary/5"
                    onClick={() => navigate("/chats/groups")}
                  >
                    <Users className="h-4 w-4" />
                    Groups
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      if (conversation.isGroup) {
                        navigate(`/chats/group/${conversation.id}`)
                      } else {
                        setSelectedConversation(conversation.id)
                        setShowConversationList(false)
                      }
                    }}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-primary/5 transition-colors border-b border-primary/5 ${
                      selectedConversation === conversation.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <Badge variant="destructive" className="ml-2 flex-shrink-0 h-5 min-w-5 px-1.5 text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      {conversation.isGroup && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {conversation.members?.length} members
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${showConversationList ? "hidden" : "flex"} md:flex flex-col flex-1`}>
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-primary/10 p-6 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-9 w-9"
                        onClick={() => setShowConversationList(true)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        {currentConversation.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{currentConversation.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {currentConversation.isOnline
                            ? "Active now"
                            : currentConversation.isGroup
                              ? `${currentConversation.members?.length} members`
                              : "Offline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {currentMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] ${msg.isOwn ? "order-2" : "order-1"}`}>
                          {!msg.isOwn && currentConversation.isGroup && (
                            <p className="text-xs font-medium text-muted-foreground mb-1 px-2">{msg.senderName}</p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${
                              msg.isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.type === "text" && <p className="text-sm">{msg.content}</p>}
                            {msg.type === "image" && (
                              <div>
                                <div className="rounded-lg overflow-hidden mb-2 border border-primary/20">
                                  <img
                                    src={msg.fileUrl || "/placeholder.svg"}
                                    alt="Shared image"
                                    className="max-w-full h-auto"
                                  />
                                </div>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            )}
                            {msg.type === "file" && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <File className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{msg.content}</p>
                                  <p className="text-xs opacity-80">{msg.fileName}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-2">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-primary/10 p-6 bg-card">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10">
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10">
                        <Smile className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 h-10 border-primary/20 focus:border-primary"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && message.trim()) {
                            console.log("Sending message:", message)
                            setMessage("")
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        className="h-10 w-10 bg-primary hover:bg-primary/90"
                        disabled={!message.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground bg-gradient-to-b from-background to-primary/5">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-primary/30" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout.Main>
  )
}