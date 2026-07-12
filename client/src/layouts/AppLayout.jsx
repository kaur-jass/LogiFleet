import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Premium styled loading spinner fallback
function PageLoader() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent dark:border-[#F5B301] dark:border-t-transparent"></div>
      <p className="text-sm font-semibold tracking-wide text-slate-500 animate-pulse dark:text-slate-400">
        Loading platform data...
      </p>
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  
  // Hide layout sidebars and navbars on authentication screens
  const isAuthPage = location.pathname === "/" || location.pathname === "/auth";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center p-4">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
