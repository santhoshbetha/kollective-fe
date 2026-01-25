
import { TrendingUp, FileText, Megaphone } from "lucide-react"
import Layout from '../components/Layout';
import { ContentTabs } from '../components/ContentTabs';
import { VoiceSpinner } from '../components/ui/VoiceSpinner';
import { PostCard } from "../components/cards/PostCard";
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
    contentType: "post",
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
    contentType: "post",
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
    contentType: "voice",
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
    contentType: "post",
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
    contentType: "voice",
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
    contentType: "post",
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
    contentType: "post",
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
    contentType: "post",
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
    contentType: "voice",
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
    contentType: "post",
  },
]

const tabs = [
  {
    id: "follows",
    label: "Follows",
    icon: FileText,
    content:  <div className="space-y-4">
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
  },
  {
    id: "trending",
    label: "Trending Posts",
    icon: TrendingUp,
    content: <div className="text-center py-8 text-muted-foreground">Trending posts coming soon...</div>
  },
  {
    id: "voices",
    label: "Trending Voices",
    icon: Megaphone,
    content: <div className="text-center py-8 text-muted-foreground">Trending voices coming soon...</div>
  },
]

const HomePage = () => {
  return (
    <>
    <Layout.Main>
      <ContentTabs tabs={tabs} defaultValue="follows" variant="default" size="lg" />
    </Layout.Main>
    </>
  );
};

export default HomePage;

/*
 <LinkFooter />
*/
