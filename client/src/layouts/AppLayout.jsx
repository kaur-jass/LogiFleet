import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  const location = useLocation();
  
  // Hide layout sidebars and navbars on authentication screens
  const isAuthPage = location.pathname === "/" || location.pathname === "/auth";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center p-4">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0 overflow-hidden">
  <Navbar />
  <main className="h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
    <Outlet />
  </main>
</div>
      </div>
    </div>
  );
}
