import clsx from "clsx";
import { Suspense } from "react";
import StickyBox from "react-sticky-box";

/** Layout container, to hold Sidebar, Main, and Aside. */
const Layout = ({ children }) => (
  <div className="relative flex grow flex-col">
    {/* Increase max-width on xl to give more room */}
    <div className="mx-auto w-full max-w-3xl grow md:grid lg:max-w-screen-2xl xl:max-w-screen-2xl md:grid-cols-12 md:gap-8 xl:px-6">
      {children}
    </div>
  </div>
);

/** Left sidebar container in the UI. */
const Sidebar = ({ children }) => {
  return (
    <>
      {/* Fixed sidebar for MD and XL screens */}
      <div className="hidden md:block fixed left-0 top-0 z-40 h-screen w-64 xl:w-80 xl:bg-background">
        <div className="h-full pt-14 px-8 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Grid-based sidebar - hidden since we use fixed sidebar */}
      <div className="hidden">
        <StickyBox offsetTop={20} offsetBottom={20}>
          <div className="px-4">
            {children}
          </div>
        </StickyBox>
      </div>
    </>
  );
};

/** Center column container in the UI. */
const Main = ({ children, className }) => (
  <main
    className={clsx(
      "bg-background pb-36 dark:bg-primary-900 sm:pb-6",
      "md:col-span-12 lg:col-span-12 xl:col-span-10 md:ml-64 lg:ml-64 xl:ml-80 xl:border-lX xl:border-rX",
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