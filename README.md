# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

//from AI chat:

src/
├── api/
│   ├── client.js                # Axios instance with 401 Interceptors
│   └── queryClient.js           # TanStack QueryClient + Persister setup
├── components/                  # Global shared UI components
│   ├── ui/
│   │   ├── SafetyModal.jsx       # Generic "Type-to-Confirm" UI
│   │   └── Toast.jsx             # Global feedback system
│   └── Layout/                  # Main Shell, Navbar, Sidebar
├── features/                    # Domain-driven feature modules
│   ├── accounts/                # Profiles, Relationships, Blocks/Mutes
│   │   ├── api/                 # useAccount, useAccountActions, useDirectory
│   │   ├── components/          # ProfileHeader, AccountCard, MoveSettings
│   │   └── schemas/             # accountSchemas.js (Zod)
│   ├── auth/                    # Login, Verification, Token Management
│   │   ├── store/               # useMeStore.js (Zustand)
│   │   └── hooks/               # useAuthActions, useMe
│   ├── chats/                   # Direct Messages & Kollective Chats
│   │   ├── api/                 # useConversations, useChatActions
│   │   ├── store/               # useTypingStore.js (Zustand)
│   │   └── components/          # ChatWindow, MessageBubble
│   ├── compose/                 # Status creation & Autocomplete
│   │   ├── api/                 # useSubmitStatus, useComposeSuggestions
│   │   ├── store/               # useComposeStore.js, useExpirationStore.js
│   │   └── components/          # ComposeForm, EmojiPicker
│   ├── emojis/                  # Custom Emojis & Reactions
│   │   ├── api/                 # useEmojis.js
│   │   ├── hooks/               # useEmojiMap.js, useReactionPicker.js
│   │   └── store/               # useRecentEmojiStore.js (Zustand)
│   ├── filters/                 # Keyword Muting & Domain Blocks
│   │   ├── api/                 # useFilters, useFilterActions
│   │   └── utils/               # filterEngine.js (Regex logic)
│   ├── statuses/                # Timelines, Polls, Quotes, History
│   │   ├── api/                 # useTimeline, useStatus, useStatusActions
│   │   ├── components/          # Timeline, StatusCard, Poll, VirtualList
│   │   ├── schemas/             # statusSchemas.js (Zod + Transformers)
│   │   └── utils/               # cacheSync.js, cacheHelpers.js
│   └── ui/                      # Global UI State (Modals, Tabs)
│       └── store/               # useConfirmStore.js, useScrollStore.js
├── utils/                       # Generic utilities
│   ├── haptics.js               # Vibration API helpers
│   ├── favicon.js               # Notification badge logic
│   └── textHighlight.jsx        # Search result highlighting
└── App.jsx                      # Root: Providers (Query, Auth) & Watchers

================================================================================
src/features/statuses/
├── api/
│   ├── statuses.js         <-- Raw Axios calls (fetchStatus, deleteStatus)
│   └── statusQueries.js    <-- queryOptions (Keys + queryFn)
├── hooks/
│   ├── useStatus.js        <-- useQuery(statusQueries.detail(id))
│   └── useEmojiReaction.js <-- useMutation + Optimistic Update Logic
└── components/
    └── StatusCard.jsx    <-- Uses the hooks

1. src/features/{feature}/api/
The "What" and "How" (Pure Functions)
This folder should contain no React logic. It shouldn't know about useQuery or useMutation. It only knows about Axios and URLs.

    statuses.js: Export raw async functions (e.g., const getStatus = ...).
    statusQueries.js: Export queryOptions. This is just a configuration object. It’s technically not a hook yet!
    
2. src/features/{feature}/hooks/
The "When" and "Where" (React Hooks)
This is where you actually execute the queries and mutations using TanStack Query's hooks.

    useStatus.js: Calls useQuery(statusQueries.detail(id)).
    useStatusActions.js: Contains your complex mutations like useEmojiReaction.
=====================================================================================
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './api/queryClient';

// Features & Stores
import { useMeStore } from './features/auth/store/useMeStore';
import { useSettingsStore } from './features/settings/store/useSettingsStore';

// Global Watchers (Custom Hooks)
import { useMe } from './features/auth/hooks/useMe';
import { useNotificationBadge } from './features/notifications/hooks/useNotificationBadge';
import { useBatterySaver } from './features/settings/hooks/useBatterySaver';
import { useMessageStreaming } from './features/messages/hooks/useMessageStreaming';

// Global UI Components
import { SafetyModal } from './components/ui/SafetyModal';
import { ToastContainer } from './components/ui/Toast';
import { AppRoutes } from './routes';

function AppWatcher() {
  const token = useMeStore((s) => s.accessToken);
  const theme = useSettingsStore((s) => s.theme);

  // 1. Auth Sync: Validates session and seeds useMeStore
  useMe();

  // 2. Real-time DMs: Initialized only if token exists
  useMessageStreaming(token);

  // 3. UI Background Tasks: Title badges and Battery/OLED sync
  useNotificationBadge();
  useBatterySaver();

  return (
    <div className={`app-root theme-${theme}`}>
      <AppRoutes />
      
      {/* 4. Global Modals (Zustand-controlled) */}
      <SafetyModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWatcher />
      
      {/* 5. DevTools (Visible only in development) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
========================================================================
Rule of thumg:
Does it call useQuery or fetch? Put it in /api.
Does it use useState/useEffect for UI behavior? Put it in /hooks.
Is it a pure function with no React hooks at all? Put it in /utils.
=========================================================================

useStatusImporter => fetchRelationships && useRelationships ==> fetchRelationships

Think of fetchRelationships as the Engine, and the other two as the Gas Pedals.

1. The Relationship Sequence (How they connect)

    fetchRelationships: The raw API logic that chunks IDs and talks to the server.
    useBatchedEntities: The TanStack Query wrapper. It checks what is missing from the cache and calls fetchRelationships to get it.
    useRelationships: The UI-driven hook. You use this in components (like a Timeline) to say: "I am looking at these 20 people right now, make sure I have their data."
    useStatusImporter: The Data-driven utility. You use this inside a queryFn (like when fetching a notification or a single status) to say: "I just got some data from the server, let me proactively seed the cache for these people."

2. The Sequence of Operations (Step-by-Step)
Here is exactly what happens when a user opens your app and loads the Home Timeline:
Step A: The Timeline Fetch

    The useTimeline hook fires.
    The queryFn calls the API and gets 20 statuses.
    Inside the queryFn, you call importFetchedStatuses(data).
    This triggers useStatusImporter, which seeds the ['status', id] and ['account', id] cache.

Step B: The Relationship "Pre-fetch"

    The Timeline component renders. It calculates the 20 Account IDs.
    It calls useRelationships(listKey, ids).
    useBatchedEntities looks at the cache. It realizes it has the Account info, but not the "Relationship" (following/blocking) info yet.
    It calls fetchRelationships(ids).

Step C: The Server Call

    fetchRelationships splits the 20 IDs into chunks (if needed) and sends ?id[]=1&id[]=2... to the server.
    The server returns the array of relationship objects.

Step D: Seeding the Cache

    useBatchedEntities receives that array.
    It loops through and calls queryClient.setQueryData(['relationship', listKey, id], data).
    Now the cache is "warm."

Step E: The Component "Pop"

    The 20 FollowButton components mount inside the statuses.
    They call useRelationship(id).
    Because of the work done in Step D, they find the data instantly. No spinners are shown.

Comparison of the "Gas Pedals"
Feature	                     useRelationships (Hook)	                    useStatusImporter (Utility)
When it runs	              During Component Rendering.	                  During API Data Fetching.
Triggered by	             The UI needing to display buttons.	            The API returning a response.
Primary Goal	             Batch fetch missing metadata.	                Side-load/Seed cache from a response.
Best For	                Timelines, Member Lists, Search.	              useInfiniteQuery, Single Status fetches.

Summary

    useStatusImporter is for when the server gives you data (like a status) and you want to save its pieces.
    useRelationships is for when the server didn't give you enough data (like follow status) and you need to go ask for it in a batch.
=========================================================================================

