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
