import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Truck,
  Route,
  Wrench,
  Fuel,
  Wallet,
  BarChart3,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel', label: 'Fuel Logs', icon: Fuel },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
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
    <aside className="hidden w-80 shrink-0 border-r border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#111827] xl:flex xl:flex-col">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5B301] text-base font-bold text-[#111827] shadow-sm">
          LF
        </div>
        <div>
          <p className="text-lg font-bold leading-tight text-[#111827] dark:text-white">
            LogiFleet
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Smart Fleet Operations
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F5B301] text-[#111827] shadow-sm shadow-[#F5B301]/30'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#1F2937] dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-[#1F2937]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5B301]/15 text-sm font-semibold text-[#D89E00] dark:text-[#F5B301]">
            FM
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">
              Fleet Manager
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              admin@logifleet.com
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#F5B301]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D89E00] dark:text-[#F5B301]">
            Admin
          </span>
        </div>

        <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#1F2937] dark:hover:text-white">
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}