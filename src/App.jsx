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
              {pathname !== '/about'?
                <Navbar 
                  onMenuClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                  isMobileNavOpen={isMobileNavOpen}
                />
                :
                <NavbarMain />
              }
            </div>
            {pathname != '/about' && (
              <div className="px-4 py-4">
                <Layout>
                  <Layout.Sidebar>
                    <SidebarNavigation 
                      onItemClick={() => setIsMobileNavOpen(false)}
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
                  </Routes>
                </Layout>
              </div>
            )}
            {pathname == '/about' && (
              <Routes>
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </GlobalHotkeys>
  );
}

export default App;
