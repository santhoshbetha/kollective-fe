import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  BadgeCheck,
  X,
  ChevronDown,
  ChevronUp,
  Paperclip,
  ImageIcon,
  Smile,
  AtSign,
  Hash,
  Mic,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Textarea } from "@/components/ui/textarea"
import Layout from "../components/Layout"

const EMOJI_LIST = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "😢",
  "😡",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "💯",
  "🙌",
  "👏",
  "🤝",
  "💪",
  "🙏",
  "😮",
  "🤯",
  "😴",
  "🤮",
  "🤡",
  "💀",
  "👀",
  "🧐",
  "😈",
  "👹",
]

function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Write a comment...",
  submitLabel = "Comment",
  attachments = [],
  onAttachmentsChange,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const textareaRef = useRef(null)

  const handleEmojiSelect = (emoji) => {
    onChange(value + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const handleFileSelect = (e, type) => {
    const files = e.target.files
    if (files && files.length > 0 && onAttachmentsChange) {
      const newAttachments = Array.from(files).map((file) => ({
        type,
        url: URL.createObjectURL(file),
        name: file.name,
      }))
      onAttachmentsChange([...attachments, ...newAttachments])
    }
    e.target.value = ""
  }

  const removeAttachment = (index) => {
    if (onAttachmentsChange) {
      onAttachmentsChange(attachments.filter((_, i) => i !== index))
    }
  }

  const insertMention = () => {
    onChange(value + "@")
    textareaRef.current?.focus()
  }

  const insertHashtag = () => {
    onChange(value + "#")
    textareaRef.current?.focus()
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Voice recording would be implemented here with Web Audio API
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="space-y-2">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === "image" ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={attachment.url || "/placeholder.svg"}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[100px]">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-0.5 hover:bg-muted-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[100px] text-sm resize-none pr-4 pb-12"
        />

        {/* Input options toolbar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Image upload */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, "image")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            {/* File attachment */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, "file")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Emoji picker */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 text-muted-foreground hover:text-primary", showEmojiPicker && "text-primary")}
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker)
                  setShowGifPicker(false)
                }}
              >
                <Smile className="h-4 w-4" />
              </Button>

              {showEmojiPicker && (
                <div className="absolute bottom-10 left-0 z-50 p-2 bg-card border rounded-lg shadow-lg w-[240px]">
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="p-1.5 hover:bg-muted rounded text-lg"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GIF picker */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 text-muted-foreground hover:text-primary", showGifPicker && "text-primary")}
                onClick={() => {
                  setShowGifPicker(!showGifPicker)
                  setShowEmojiPicker(false)
                }}
              >
                <Gift className="h-4 w-4" />
              </Button>

              {showGifPicker && (
                <div className="absolute bottom-10 left-0 z-50 p-3 bg-card border rounded-lg shadow-lg w-[280px]">
                  <input
                    type="text"
                    placeholder="Search GIFs..."
                    className="w-full px-3 py-2 text-sm bg-muted rounded-md mb-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-muted rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-xs text-muted-foreground"
                        onClick={() => setShowGifPicker(false)}
                      >
                        GIF {i}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mention */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={insertMention}
            >
              <AtSign className="h-4 w-4" />
            </Button>

            {/* Hashtag */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={insertHashtag}
            >
              <Hash className="h-4 w-4" />
            </Button>

            {/* Voice recording */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 text-muted-foreground hover:text-primary",
                isRecording && "text-red-500 animate-pulse",
              )}
              onClick={toggleRecording}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          <Button size="sm" onClick={onSubmit} disabled={!value.trim() && attachments.length === 0} className="h-8">
            {submitLabel}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl</kbd> +{" "}
        <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to submit
      </p>
    </div>
  )
}

function CommentThread({
  comment,
  depth = 0,
  onVote,
  onReply,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [replyAttachments, setReplyAttachments] = useState([])
  const [localVotes, setLocalVotes] = useState(comment.votes)
  const [localHasVoted, setLocalHasVoted] = useState(comment.hasVoted)

  const handleVote = (type) => {
    if (localHasVoted === type) {
      setLocalVotes(localVotes + (type === "up" ? -1 : 1))
      setLocalHasVoted(null)
    } else if (localHasVoted) {
      setLocalVotes(localVotes + (type === "up" ? 2 : -2))
      setLocalHasVoted(type)
    } else {
      setLocalVotes(localVotes + (type === "up" ? 1 : -1))
      setLocalHasVoted(type)
    }
  }

  const handleSubmitReply = () => {
    if (replyContent.trim() || replyAttachments.length > 0) {
      onReply(comment.id, replyContent, replyAttachments)
      setReplyContent("")
      setReplyAttachments([])
      setIsReplying(false)
    }
  }

  const profileUrl = `/profile/${comment.authorType}/${comment.author}`
  const maxDepth = 4
  const shouldNest = depth < maxDepth

  return (
    <div
      className={cn(
        "relative",
        depth > 0 && "ml-4 pl-4 border-l-2 border-border/50 hover:border-primary/30 transition-colors",
      )}
    >
      <div className="py-3">
        <div className="flex gap-3">
          {comment.replies.length > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          )}

          <Link to={profileUrl} className="flex-shrink-0">
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} alt={comment.author} />
              <AvatarFallback>{comment.author[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={profileUrl} className="flex items-center gap-1 hover:underline">
                <span className="font-medium text-sm text-foreground">{comment.author}</span>
                {comment.authorType === "institution" && (
                  <BadgeCheck className="h-3.5 w-3.5 text-primary fill-primary/20" />
                )}
              </Link>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>

            {!isCollapsed && (
              <>
                <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{comment.content}</p>

                <div className="flex items-center gap-1 mt-2">
                  <div className="flex items-center gap-0.5 bg-muted/50 rounded-full px-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7", localHasVoted === "up" && "text-primary")}
                      onClick={() => handleVote("up")}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <span
                      className={cn(
                        "text-xs font-medium tabular-nums min-w-[2rem] text-center",
                        localHasVoted === "up" && "text-primary",
                        localHasVoted === "down" && "text-destructive",
                      )}
                    >
                      {localVotes}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7", localHasVoted === "down" && "text-destructive")}
                      onClick={() => handleVote("down")}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsReplying(!isReplying)}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Reply
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>

                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-muted-foreground">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {isReplying && (
                  <div className="mt-3">
                    <CommentInput
                      value={replyContent}
                      onChange={setReplyContent}
                      onSubmit={handleSubmitReply}
                      placeholder="Write a reply..."
                      submitLabel="Reply"
                      attachments={replyAttachments}
                      onAttachmentsChange={setReplyAttachments}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setIsReplying(false)
                        setReplyContent("")
                        setReplyAttachments([])
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}

            {isCollapsed && comment.replies.length > 0 && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="text-xs text-muted-foreground hover:text-primary mt-1"
              >
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"} hidden
              </button>
            )}
          </div>
        </div>
      </div>

      {!isCollapsed && comment.replies.length > 0 && (
        <div className={cn(!shouldNest && "ml-0 pl-0 border-l-0")}>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={shouldNest ? depth + 1 : depth}
              onVote={onVote}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const mockComments = [
  {
    id: 1,
    author: "quantumFan",
    authorAvatar: "/tech-user.png",
    authorType: "individual",
    content:
      "This is absolutely groundbreaking! The implications for cryptography alone are massive. Can't wait to see how this develops over the next few years.",
    timestamp: "2h ago",
    votes: 234,
    hasVoted: null,
    replies: [
      {
        id: 2,
        author: "cryptoExpert",
        authorAvatar: "/developer-avatar.png",
        authorType: "individual",
        content:
          "Agreed! Current encryption methods will need to be completely redesigned. Post-quantum cryptography is going to be essential.",
        timestamp: "1h ago",
        votes: 89,
        hasVoted: "up",
        replies: [
          {
            id: 3,
            author: "securityPro",
            authorAvatar: "/web-developer.png",
            authorType: "individual",
            content: "We're already working on quantum-resistant algorithms at my company. It's a race against time.",
            timestamp: "45m ago",
            votes: 45,
            hasVoted: null,
            replies: [],
          },
          {
            id: 4,
            author: "CyberSecCorp",
            authorAvatar: "/tech-company-logo.jpg",
            authorType: "institution",
            content:
              "Our latest whitepaper covers this exact topic. Happy to share with anyone interested in the technical details.",
            timestamp: "30m ago",
            votes: 67,
            hasVoted: null,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 5,
    author: "scienceEnthusiast",
    authorAvatar: "/science-enthusiast.jpg",
    authorType: "individual",
    content:
      "The drug discovery applications are what excite me most. Simulating molecular interactions at this scale could revolutionize medicine.",
    timestamp: "1h ago",
    votes: 156,
    hasVoted: null,
    replies: [
      {
        id: 6,
        author: "PharmaTech",
        authorAvatar: "/abstract-geometric-logo.png",
        authorType: "institution",
        content:
          "We've already partnered with quantum computing labs for exactly this purpose. Early results are promising.",
        timestamp: "45m ago",
        votes: 78,
        hasVoted: null,
        replies: [],
      },
    ],
  },
  {
    id: 7,
    author: "skepticalDev",
    authorAvatar: "/data-scientist-workspace.png",
    authorType: "individual",
    content:
      "I'm cautiously optimistic. We've heard similar claims before. What's the error correction rate on this processor?",
    timestamp: "30m ago",
    votes: 92,
    hasVoted: null,
    replies: [],
  },
]

const mockPosts = [
  {
    id: 1,
    votes: 2847,
    community: "r/technology",
    author: "techEnthusiast",
    authorAvatar: "/tech-enthusiast.png",
    authorType: "individual",
    timestamp: "3h",
    title: "New breakthrough in quantum computing announced",
    content:
      "Researchers at MIT have successfully demonstrated a 1000-qubit quantum processor that maintains coherence for unprecedented durations. This could revolutionize cryptography and drug discovery.",
    image: "/quantum-computer.png",
    comments: 423,
    shares: 238,
    hasVoted: "up",
  },
  {
    id: 2,
    votes: 5234,
    community: "r/announcements",
    author: "TechCorp",
    authorAvatar: "/tech-company-logo.jpg",
    authorType: "institution",
    timestamp: "4h",
    title: "Introducing our new AI-powered development platform",
    content:
      "We're excited to announce the launch of DevAI Pro, a revolutionary platform that combines AI assistance with traditional development tools. Early access starts next week for our enterprise customers.",
    image: "/modern-tech-platform.png",
    comments: 892,
    shares: 1456,
    hasVoted: null,
  },
  {
    id: 3,
    votes: 1523,
    community: "r/programming",
    author: "codeWizard",
    authorAvatar: "/developer-avatar.png",
    authorType: "individual",
    timestamp: "5h",
    title: "Why I switched from React to Svelte and never looked back",
    content:
      "After 5 years of React development, I decided to give Svelte a try. The developer experience is incredible - less boilerplate, better performance, and the reactivity model just makes sense.",
    comments: 892,
    shares: 156,
    hasVoted: null,
  },
  {
    id: 4,
    votes: 3891,
    community: "r/science",
    author: "MIT_Research",
    authorAvatar: "/mit-logo-generic.png",
    authorType: "institution",
    timestamp: "6h",
    title: "Our latest study on climate change mitigation strategies",
    content:
      "MIT Climate Lab has published groundbreaking research on carbon capture technology that could reduce atmospheric CO2 by 30% within the next decade. Full paper available in Nature.",
    image: "/climate-research-lab.jpg",
    comments: 1567,
    shares: 2341,
    hasVoted: null,
  },
  {
    id: 5,
    votes: 4201,
    community: "r/science",
    author: "scienceDaily",
    authorAvatar: "/science-enthusiast.jpg",
    authorType: "individual",
    timestamp: "7h",
    title: "Study finds that regular exercise can reverse aging at cellular level",
    content:
      "A comprehensive 10-year study involving 15,000 participants shows that consistent moderate exercise can actually reverse cellular aging markers by up to 9 years.",
    image: "/exercise-fitness-science.jpg",
    comments: 1247,
    shares: 892,
    hasVoted: null,
  },
  {
    id: 6,
    votes: 6782,
    community: "r/technology",
    author: "SpaceX",
    authorAvatar: "/spacex-logo.jpg",
    authorType: "institution",
    timestamp: "8h",
    title: "Starship successfully completes orbital test flight",
    content:
      "Today marks a historic milestone as Starship completed its first full orbital test flight. This brings us one step closer to making life multiplanetary. Thank you to our incredible team!",
    image: "/spaceship-launch.jpg",
    comments: 3421,
    shares: 5678,
    hasVoted: "up",
  },
  {
    id: 7,
    votes: 892,
    community: "r/webdev",
    author: "frontendDev",
    authorAvatar: "/web-developer.png",
    authorType: "individual",
    timestamp: "9h",
    title: "CSS Grid vs Flexbox: When to use which?",
    content:
      "A practical guide based on real-world scenarios. Grid excels at 2D layouts while Flexbox is perfect for 1D arrangements. Here's my decision framework after building 50+ production sites.",
    comments: 234,
    shares: 89,
    hasVoted: null,
  },
  {
    id: 8,
    votes: 2156,
    community: "r/gaming",
    author: "UnityTechnologies",
    authorAvatar: "/abstract-geometric-shape.png",
    authorType: "institution",
    timestamp: "10h",
    title: "Unity 2024 is here with revolutionary real-time rendering",
    content:
      "We're thrilled to announce Unity 2024, featuring our new HDRP+ rendering pipeline that delivers photorealistic graphics at 120fps. Available now for all Unity Pro subscribers.",
    image: "/game-engine-interface.jpg",
    comments: 567,
    shares: 423,
    hasVoted: null,
  },
  {
    id: 9,
    votes: 1678,
    community: "r/datascience",
    author: "dataScientist_AI",
    authorAvatar: "/data-scientist-workspace.png",
    authorType: "individual",
    timestamp: "11h",
    title: "How I built a recommendation system that increased conversions by 340%",
    content:
      "Deep dive into the architecture and algorithms behind a production recommendation engine. Includes code samples, performance metrics, and lessons learned from 2 years of iteration.",
    comments: 445,
    shares: 267,
    hasVoted: null,
  },
  {
    id: 10,
    votes: 4523,
    community: "r/business",
    author: "OpenAI",
    authorAvatar: "/abstract-geometric-logo.png",
    authorType: "institution",
    timestamp: "12h",
    title: "GPT-5 Preview: The next generation of AI reasoning",
    content:
      "Today we're sharing an early look at GPT-5's capabilities. With improved reasoning, longer context windows, and multimodal understanding, it represents a significant leap forward in AI technology.",
    image: "/ai-neural-network.png",
    comments: 5234,
    shares: 8901,
    hasVoted: "up",
  },
]

export default function PostDetailsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const postId = Number(params.id)

  const post = mockPosts.find((p) => p.id === postId)

  const [votes, setVotes] = useState(post?.votes || 0)
  const [hasVoted, setHasVoted] = useState(post?.hasVoted || null)
  const [isSaved, setIsSaved] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const [comments, setComments] = useState(mockComments)
  const [newComment, setNewComment] = useState("")
  const [newCommentAttachments, setNewCommentAttachments] = useState([])

  // Scroll to top when component mounts
  useEffect(() => {
    console.log('Scrolling to top')
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
    }, 100)
  }, [])

  if (!post) {
    return (
      <Layout.Main>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout.Main>
    )
  }

  const handleVote = (type) => {
    if (hasVoted === type) {
      setVotes(votes + (type === "up" ? -1 : 1))
      setHasVoted(null)
    } else if (hasVoted) {
      setVotes(votes + (type === "up" ? 2 : -2))
      setHasVoted(type)
    } else {
      setVotes(votes + (type === "up" ? 1 : -1))
      setHasVoted(type)
    }
  }

  const handleCommentVote = (commentId, type) => {
    console.log(`Voted ${type} on comment ${commentId}`)
  }

  const handleCommentReply = (parentId, content, attachments) => {
    const newReply = {
      id: Date.now(),
      author: "currentUser",
      authorAvatar: "/tech-enthusiast.png",
      authorType: "individual",
      content,
      timestamp: "Just now",
      votes: 0,
      hasVoted: null,
      replies: [],
    }

    const addReplyToComment = (comments) => {
      return comments.map((comment) => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...comment.replies, newReply] }
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: addReplyToComment(comment.replies) }
        }
        return comment
      })
    }

    setComments(addReplyToComment(comments))
  }

  const handleSubmitComment = () => {
    if (newComment.trim() || newCommentAttachments.length > 0) {
      const newCommentObj = {
        id: Date.now(),
        author: "currentUser",
        authorAvatar: "/tech-enthusiast.png",
        authorType: "individual",
        content: newComment,
        timestamp: "Just now",
        votes: 0,
        hasVoted: null,
        replies: [],
      }
      setComments([newCommentObj, ...comments])
      setNewComment("")
      setNewCommentAttachments([])
    }
  }

  const profileUrl = `/profile/${post.authorType}/${post.author}`

  return (
    <Layout.Main>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

      <article
        className={cn(
          "rounded-lg border border-border bg-card p-6",
          post.authorType === "institution" && "border-primary/20 bg-card/50",
        )}
      >
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", hasVoted === "up" && "text-primary hover:text-primary")}
              onClick={() => handleVote("up")}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>

            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                hasVoted === "up" && "text-primary",
                hasVoted === "down" && "text-destructive",
              )}
            >
              {votes > 999 ? `${(votes / 1000).toFixed(1)}k` : votes}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", hasVoted === "down" && "text-destructive hover:text-destructive")}
              onClick={() => handleVote("down")}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-primary hover:underline cursor-pointer">{post.community}</span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2">
                <Link to={profileUrl}>
                  <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.author} />
                    <AvatarFallback>{post.author[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link to={profileUrl} className="flex items-center gap-1 hover:underline">
                  <span className="text-muted-foreground hover:text-foreground">
                    {post.authorType === "individual" ? "u/" : ""}
                    {post.author}
                  </span>
                  {post.authorType === "institution" && (
                    <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                  )}
                </Link>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{post.timestamp}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold leading-tight text-foreground text-balance">{post.title}</h1>
              <p className="text-base leading-relaxed text-foreground text-pretty">{post.content}</p>
            </div>

            {post.image && (
              <div
                className="relative aspect-[2/1] overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsImageExpanded(true)}
              >
                <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{comments.length} Comments</span>
              </Button>

              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-2", isSaved && "text-primary")}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                <span className="text-sm">Save</span>
              </Button>

              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-card rounded-xl border p-4 mt-4">
              <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>

              <div className="mb-6">
                <CommentInput
                  value={newComment}
                  onChange={setNewComment}
                  onSubmit={handleSubmitComment}
                  placeholder="What are your thoughts?"
                  submitLabel="Comment"
                  attachments={newCommentAttachments}
                  onAttachmentsChange={setNewCommentAttachments}
                />
              </div>

              <div className="space-y-0 divide-y divide-border/50">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      onVote={handleCommentVote}
                      onReply={handleCommentReply}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {isImageExpanded && post.image && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={() => setIsImageExpanded(false)}
        >
          <button
            onClick={() => setIsImageExpanded(false)}
            className="absolute top-4 right-4 z-[70] p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Close image"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <div className="relative w-[60%] h-[60vh]">
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      </div>
    </Layout.Main>
  )
}