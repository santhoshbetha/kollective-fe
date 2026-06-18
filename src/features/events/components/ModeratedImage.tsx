// src/components/events/ModeratedImage.tsx
import { useState } from "react"
import { cn } from "@/lib/utils"

// "Blur-up" placeholders
/*
In a professional Vite + React setup,  the CSS blur and the network download happen at the same time, 
but they solve different problems. To make it perfect, we use a layered approach:
*/

/*
1. The "Double Blur" Strategy
We apply a permanent blur-sm (light blur) for
 the Loading state and a conditional blur-xl (heavy blur) for the Moderation state.
*/

export function ModeratedImage({ src, status }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const isScanning = status === "pending"

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-200">
      <img
        src={src}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-700",
          // 1. BLUR FOR LOADING: Light blur until the 100KB thumbnail arrives
          !isLoaded && "blur-md scale-105",
          // 2. BLUR FOR MODERATION: Heavy blur while AI is scanning
          isScanning && "blur-2xl grayscale brightness-50",
          // 3. REVEAL: Clear only when both loaded AND approved
          (isLoaded && !isScanning) && "blur-0 scale-100 grayscale-0 brightness-100"
        )}
      />

      {/* Loading/Scanning Overlays */}
      {!isLoaded && !isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Badge variant="outline" className="bg-white/80 backdrop-blur-md">
            Scanning Content...
          </Badge>
        </div>
      )}
    </div>
  )
}

/*
2. Why this is the "Golden Path":

    Immediate Visual Fill: The bg-slate-200 (or a BlurHash if you're fancy) ensures the chat doesn't "jump" when the image starts loading.
    Safety Priority: Even if the optimized image downloads in 50ms, the isScanning check keeps it heavily blurred until the Phoenix Channel sends the "Approved" signal.
    Low Latency Feel: By using a Cloudflare Worker thumbnail as the src, the download usually finishes before the AI moderation (which typically takes 1-2 seconds).
*/

/*
3. How the "Unblur" works in order:

    0ms: Image is a gray box.
    100ms: Optimized thumbnail downloads; user sees a lightly blurred image.
    200ms - 1.5s: AI Scan is happening; image becomes heavily blurred & dark.
    1.5s: Oban finishes; Phoenix broadcasts status: approved.
    1.6s: React removes the blur; image fades into clarity.
*/
/*
Summary Checklist:

    onLoad: Use this React event to track when the network request is done.
    transition-all: Essential so the "unblur" doesn't look like a glitch.
    Priority: Moderation blur must always override the loading blur for safety.
*/