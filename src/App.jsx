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

function App() {
  const node = useRef(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [theme, _setTheme] = useState("dark");
  const location = useLocation();
  const pathname = location.pathname;

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
    <GlobalHotkeys node={node}>
      <div ref={node}>
        <div className="">
          <div className='z-10 flex min-h-screen flex-col'>
            <div className='sticky top-0 z-50'>
              {pathname !== '/about' && pathname !== '/background-showcase'?
                <Navbar 
                  onMenuClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                  isMobileNavOpen={isMobileNavOpen}
                />
                :
                <NavbarMain />
              }
            </div>
            {pathname != '/about' && pathname != '/background-showcase' && (
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
            {pathname == '/about' || pathname == '/background-showcase' && (
              <Routes>
                <Route path="/about" element={<AboutPage />} />
                <Route path="/background-showcase" element={<BackgroundShowcasePage />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </GlobalHotkeys>
  );
}

export default App;
