import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Wallet,
  BarChart3,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "Trips", icon: Truck },
  { to: "/fuel", label: "Fuel Logs", icon: Droplet },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear stored authentication data
    localStorage.clear();

    // Replace current history entry
    navigate("/", { replace: true });

    // Prevent going back using browser history
    const handleLogout = () => {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 xl:block">
      <div className="mb-10">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          TransitOps
        </div>

        <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Smart Transport Platform
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}