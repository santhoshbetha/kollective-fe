import clsx from "clsx";
import { Suspense } from "react";
import StickyBox from "react-sticky-box";

/** Layout container, to hold Sidebar, Main, and Aside. */
const LayouX = ({ children }) => (
  <div className="relative flex grow flex-col">
    <div className="mx-auto w-full max-w-3xl grow sm:px-6 md:grid md:max-w-7xl md:grid-cols-12 md:gap-8 md:px-8">
      {children}
    </div>
  </div>
);

const Layout = ({ children }) => (
  <div className="relative flex grow flex-col">
    <div className="mx-auto w-full max-w-3xl grow xl:px-6 md:grid lg:max-w-7xl md:grid-cols-12 md:gap-8">
      {children}
    </div>
  </div>
);

/*
md:grid md:grid-cols-12 md:gap-8 
mx-auto w-full max-w-3xl grow lg:px-6 md:grid lg:max-w-7xl md:grid-cols-12 md:gap-8
*/

/** Left sidebar container in the UI. */
const Sidebar = ({ children }) => (
  <div className="hidden lg:col-span-3 lg:block">
    <StickyBox>
      {children}
    </StickyBox>
  </div>
);

/** Center column container in the UI. */
const Main = ({ children, className }) => (
  <main
    className={clsx(
       "bg-background pb-36 border-none \
      dark:bg-primary-900 sm:pb-6 md:col-span-12 lg:col-span-9 lg:border-l xl:col-span-6 xl:border-r",
      className,
    )}
  >
    {children}
  </main>
);

/** Right sidebar container in the UI. */
const Aside = ({ children }) => (
  <aside className="hidden xl:col-span-3 xl:block">
    <StickyBox className="space-y-6 py-6 pb-12">
      <Suspense>{children}</Suspense>
    </StickyBox>
  </aside>
);

Layout.Sidebar = Sidebar;
Layout.Main = Main;
Layout.Aside = Aside;

export default Layout;
