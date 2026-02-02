import { useRef, useEffect, useState } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import GlobalHotkeys from "./features/ui/util/global-hotkeys";
import { WrappedRoute } from "./features/ui/util/react-router-helpers";
import SidebarNavigation from "./components/SidebarNavigation";
import Navbar from "./components/Navbar";
import NavbarMain from "./components/NavbarMain";
import HomePage from "./pages/HomePage";
import StatusPage from "./pages/StatusPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import ExplorePage from "./pages/ExplorePage";
import DefaultPage from "./pages/DefaultPage";
import AboutPage from "./pages/AboutPage";
import EventsPage from "./pages/EventsPage";
import BroadcastingPage from "./pages/BroadcastingPage";
import VideosPage from "./pages/VideosPage";
import PollsPage from "./pages/PollsPage";
import BusinessesPage from "./pages/BusinessesPage";
import ChatsPage from "./pages/ChatsPage";
import SettingsPage from "./pages/SettingsPage";
import CreateEventPage from "./pages/CreateEventPage";
import PostBusinessPage from "./pages/PostBusinessPage";
import EditProfilePage from "./pages/EditProfilePage";
import CreatePollPage from "./pages/CreatePollPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import VideoDetailsPage from "./pages/VideoDetailsPage";
import PostDetailsPage from "./pages/PostDetailsPage";
import BusinessDetailsPage from "./pages/BusinessDetailsPage";
import BusinessProposalDetailsPage from "./pages/BusinessProposalDetailsPage";
import BackgroundShowcasePage from "./pages/BackgroundShowcasePage";
import FontShowcasePage from "./pages/FontShowcasePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ConfirmationNewPage from "./pages/ConfirmationNewPage";

import OfflineBanner from "./components/OfflineBanner";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-async-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data in localStorage is considered "stale" but "available"
      gcTime: 1000 * 60 * 60 * 24, // Keep in storage for 24 hours
    //  staleTime: 1000 * 60 * 5,    // Trust offline data for 5 mins
       // Automatically refetch stale data when the window gets focus "Window Focus Refetching"
      refetchOnWindowFocus: true, 
      // If data is less than 30 seconds old, don't bother refetching on focus
      staleTime: 30000, 
    },
    mutations: {
      // 1. Pause mutations until the user is back online
      networkMode: 'offlineFirst',
      // 2. Retry failed mutations 3 times (e.g., if server times out)
      retry: 3,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  // Key used in localStorage
  key: 'KOLLECTIVE_OFFLINE_CACHE', 
  // Ensures we don't block the UI thread during large saves
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
    // Optional: Throttle saves to disk for better performance
  throttleTime: 1000
});

function App() {
  const node = useRef(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [theme, _setTheme] = useState("dark");
  const location = useLocation();
  const pathname = location.pathname;

  //Trend Prefetching
  useEffect(() => {
    // Global prefetch on mount
    queryClient.prefetchQuery({
      queryKey: ['trends', 'tags'],
      queryFn: () => api.get('/api/v1/trends').then(res => res.data),
    });
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister }}
    >
      <GlobalHotkeys node={node}>
        <div ref={node}>
          <div className='z-10 flex min-h-screen flex-col'>
            <div className='sticky top-0 z-50'>
              {pathname !== '/about' && pathname !== '/background-showcase' && pathname !== '/font-showcase' && pathname !== '/signup' && pathname !== '/login' && pathname !== '/auth/forgot-password' && pathname !== '/auth/confirmation/new'?
              <Navbar 
                onMenuClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                isMobileNavOpen={isMobileNavOpen}
              />
              :
              <NavbarMain />
            }
          </div>
          {pathname != '/about' && pathname != '/background-showcase' && pathname != '/font-showcase' && pathname != '/signup' && pathname != '/login' && pathname != '/auth/forgot-password' && pathname != '/auth/confirmation/new' && (
            <div className="px-4 py-4 ">
              <Layout>
                <Layout.Sidebar>
                  <SidebarNavigation 
                    onItemClick={() => setIsMobileNavOpen(false)}
                    onCreatePost={() => {
                      // Handle create post action
                      console.log('Create post clicked')
                    }}
                  />
                </Layout.Sidebar>

                <aside
                  className={`fixed inset-y-0 left-0 z-50 w-64 bg-transparent top-12
                    transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
                  }`}
                >
                  <div className="h-full overflow-y-auto pt-0 px-4">
                    <SidebarNavigation
                      onItemClick={() => setIsMobileNavOpen(false)}
                      onCreatePost={() => {
                        setIsMobileNavOpen(false)
                      }}
                    />
                  </div>
                </aside>
                
                {isMobileNavOpen && (
                  <div 
                    className="fixed inset-0 z-40 lg:hidden" 
                    onClick={() => setIsMobileNavOpen(false)} 
                  />
                )}

                <Routes>
                  <Route path="/" element={<WrappedRoute page={HomePage} />} />
                  <Route path="/statuses" element={<WrappedRoute page={StatusPage} />} />
                  <Route path="/communities" element={<WrappedRoute page={CommunitiesPage} />} />
                  <Route path="/explore" element={<WrappedRoute page={ExplorePage} />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route path="/events/create" element={<CreateEventPage />} />
                  <Route path="/broadcasting" element={<WrappedRoute page={BroadcastingPage} />} />
                  <Route path="/videos" element={<WrappedRoute page={VideosPage} />} />
                  <Route path="/videos/:id" element={<VideoDetailsPage />} />
                  <Route path="/post/:id" element={<PostDetailsPage />} />
                  <Route path="/polls" element={<WrappedRoute page={PollsPage} />} />
                  <Route path="/polls/create" element={<WrappedRoute page={CreatePollPage} />} />
                  <Route path="/chats" element={<WrappedRoute page={ChatsPage} />} />
                  <Route path="/businesses" element={<WrappedRoute page={BusinessesPage} />} />
                  <Route path="/businesses/:id" element={<BusinessDetailsPage />} />
                  <Route path="/businesses/proposal/:id" element={<BusinessProposalDetailsPage />} />
                  <Route path="/businesses/post" element={<WrappedRoute page={PostBusinessPage} />} />
                  <Route path="/profile/edit" element={<WrappedRoute page={EditProfilePage} />} />
                  <Route path="/settings" element={<WrappedRoute page={SettingsPage} />} />
                </Routes>
              </Layout>
            </div>
          )}
          {(pathname === '/about' || pathname === '/background-showcase' || pathname === '/font-showcase' || pathname === '/signup' || pathname === '/login' || pathname === '/auth/forgot-password' || pathname === '/auth/confirmation/new') && (
            <Routes>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/background-showcase" element={<BackgroundShowcasePage />} />
              <Route path="/font-showcase" element={<FontShowcasePage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/confirmation/new" element={<ConfirmationNewPage />} />
            </Routes>
          )}
        </div>
      </div>
       <OfflineBanner />
    </GlobalHotkeys>
    <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

export default App;

/*

FROM AI cHAT:

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
      
      {/* 4. Global Modals (Zustand-controlled) *//*}
      <SafetyModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWatcher />
      
      {/* 5. DevTools (Visible only in development) *//*}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

*/