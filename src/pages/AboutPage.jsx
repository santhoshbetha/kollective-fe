import { useState } from "react"
import { Zap, Link2, MessageCircle, Compass, ChevronDown } from "lucide-react";
import { Footer } from "../components/Footer";

const AboutPage = () => {
    const [openFaq, setOpenFaq] = useState(null)

    const faqs = [
        {
        question: "What is SocialFeed?",
        answer:
            "SocialFeed is a community-driven platform where you can share your thoughts, connect with others, and engage in meaningful conversations. Whether you want to reach your local community or a global audience, we give you the tools to make your voice heard.",
        },
        {
        question: "How do I get started?",
        answer:
            "Simply sign up for an account, choose a username, and start posting! You can customize your profile, follow other users, join communities, and participate in discussions right away.",
        },
        {
        question: "What types of content can I share?",
        answer:
            "You can share regular posts, voice posts about concerning issues, videos, create polls, organize events, broadcast live, and much more. Choose your target audience from local to global reach.",
        },
        {
        question: "Is SocialFeed free to use?",
        answer:
            "Yes, SocialFeed is free to use. We believe in making social connections accessible to everyone without barriers.",
        },
        {
        question: "How do I control who sees my content?",
        answer:
            "When creating a post, you can select your target audience: Local (your city), State, Country, Global, or Followers Only. This gives you precise control over who can see your content.",
        },
    ]
    
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-16">
          <div className="inline-block space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold text-balance bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ fontFamily: "Protest Riot, sans-serif", lineHeight: "0.9" }}>
              Kollective99
            </h1>
            <div className="relative inline-block">
              {/* Glow effect background */}
              <div className="absolute inset-0 rounded-full bg-[#E2023F] blur-lg opacity-30 animate-pulse"></div>

              {/* Main badge */}
              <div className="relative rounded-full bg-[#E2023F] px-6 py-2 text-xl font-bold text-white shadow-2xl border-2 border-white/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300 hover:scale-105 transition-transform duration-300" style={{ fontFamily: "Protest Riot, sans-serif" }}>
                <span className="relative z-10 tracking-wider">FOR THE PEOPLE, OF THE PEOPLE</span>

                {/* Inner shine effect */}
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-white/15 to-transparent animate-pulse"></div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 w-5 h-5 bg-yellow-400 rounded-full animate-bounce delay-500 shadow-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-400 rounded-full animate-bounce delay-700 shadow-lg"></div>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
            If 'X','Threads' and 'Truth' feel like some one's private property and decentralized apps make us disconnected,
            <span className="font-semibold text-foreground"> Join Kollective to share your 'Voice'.</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent">Create a profile</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choose a username, add a bio, and you're good to go. Share your thoughts locally or globally.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent">Share your voice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Post content that matters to you. Target your audience from local communities to the entire world.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent">Ask and answer questions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Engage with the community in an open and friendly way. Share knowledge and learn from others.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent">Discover</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Keep an eye on the people you admire, explore communities, and expand your circle.
            </p>
          </div>
        </div>

        <div className="py-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about SocialFeed</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/50 transition-colors"
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AboutPage;

/*
            <h1 className="text-7xl md:text-8xl font-bold text-balance bg-linear-to-r from-red-700 via-purple-700 to-red-900 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ fontFamily: "Protest Riot, sans-serif", lineHeight: "0.9" }}>
              Kollective99
            </h1>
            <h1 className="text-7xl md:text-8xl font-bold text-balance bg-linear-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ fontFamily: "Protest Riot, sans-serif", lineHeight: "0.9" }}>
              Kollective99
            </h1>
*/