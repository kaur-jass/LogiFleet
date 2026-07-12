import { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import {
  Truck, Route, Wrench, Users, Gauge, Clock,
  Fuel as FuelIcon, Receipt, BarChart3,
} from 'lucide-react';
import Table from './Table';
import Badge from './Badge';
import { dashboardKpis } from '../services/mockData';
import { getDashboardKpis } from '../services/dashboardService';
import { getTrips } from '../services/tripService';
import { getFuelLogs } from '../services/fuelService';
import { getExpenses } from '../services/expenseService';

const statusVariant = {
  DRAFT: 'info',
  DISPATCHED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabel = (status) => <Badge variant={statusVariant[status] || 'neutral'}>{status}</Badge>;

const columns = [
  { key: 'id', label: 'Trip ID' },
  { key: 'vehicleId', label: 'Vehicle' },
  { key: 'driverId', label: 'Driver' },
  { key: 'destination', label: 'Destination' },
  { key: 'status', label: 'Status', render: (row) => statusLabel(row.status) },
  { key: 'expectedRevenue', label: 'Expected Revenue', render: (row) => `₹${row.expectedRevenue?.toLocaleString() || 0}` },
];

// ---------------------------------------------
// Hook: reads the existing theme toggle's state.
// Does NOT create a new toggle — just observes the
// `dark` class Tailwind's toggle already applies to <html>.
// ---------------------------------------------
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// ---------------------------------------------
// Themed building blocks — light + dark support
// ---------------------------------------------
const KpiCard = ({ label, value, accent, icon }) => (
  <div className="bg-white dark:bg-[#1F2937] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700/50">
    <div className="flex items-center justify-between">
      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{label}</p>
      {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
    </div>
    <p className={`text-xl sm:text-2xl font-semibold mt-2 ${accent || 'text-gray-900 dark:text-white'}`}>
      {value}
    </p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-4 sm:p-5 min-w-0">
    <p className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{title}</p>
    {children}
  </div>
);

const ActionButton = ({ children, onClick, icon, primary }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      primary
        ? 'bg-[#F5B301] text-gray-900 hover:brightness-95'
        : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    {children}
  </button>
);

export default function DashboardPageContent() {
  const [kpis, setKpis] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentFuel, setRecentFuel] = useState([]);
  const [recentExp, setRecentExp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const isDark = useIsDarkMode();

  const chartData = useMemo(() => dashboardKpis.tripsPerMonth, []);
  const fuelData = useMemo(() => dashboardKpis.fuelConsumption, []);
  const expenseData = useMemo(() => dashboardKpis.expenseDistribution, []);
  const revenueData = useMemo(() => dashboardKpis.revenueExpense, []);

  // Theme-aware chart colors — grid/axis/tooltip only.
  // Data colors (yellow accent, blue, etc.) stay the same in both modes.
  const chartTheme = {
    grid: isDark ? '#374151' : '#E5E7EB',
    axis: isDark ? '#9CA3AF' : '#6B7280',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDark ? '#374151' : '#E5E7EB',
    tooltipText: isDark ? '#FFFFFF' : '#111827',
  };
  const tooltipStyle = {
    backgroundColor: chartTheme.tooltipBg,
    border: `1px solid ${chartTheme.tooltipBorder}`,
    borderRadius: 8,
    color: chartTheme.tooltipText,
    fontSize: 12,
  };

  useEffect(() => {
    async function loadData() {
      try {
        const userRole = localStorage.getItem("role");
        setRole(userRole);

        const kpiRes = await getDashboardKpis();
        setKpis(kpiRes.data);

        const tripsRes = await getTrips();
        setRecentTrips(tripsRes.data?.slice(0, 5) || []);

        const fuelRes = await getFuelLogs();
        setRecentFuel(fuelRes.data?.slice(0, 5) || []);

        if (userRole === "FLEET_MANAGER" || userRole === "FINANCIAL_ANALYST") {
          const expRes = await getExpenses();
          setRecentExp(expRes.data?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error("Dashboard loading error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-gray-50 dark:bg-[#111827] text-sm font-medium text-gray-500 dark:text-gray-400">
        Loading fleet dashboard...
      </div>
    );
  }

  const totalVehicles = (kpis?.activeVehicles || 0) + (kpis?.availableVehicles || 0) + (kpis?.vehiclesInMaintenance || 0);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 dark:bg-[#111827] p-3 sm:p-4 md:p-6 lg:p-8 text-gray-900 dark:text-gray-100">

      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Fleet Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
          Real-time overview of your fleet operations and performance.
        </p>
      </div>

      {/* KPI Row 1 — 1 col mobile / 2 col tablet / 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <KpiCard label="Total Vehicles" value={totalVehicles} icon={<Truck size={18} />} />
        <KpiCard label="Active Trips" value={kpis?.activeTrips || 0} accent="text-[#B8860B] dark:text-[#F5B301]" icon={<Route size={18} />} />
        <KpiCard label="Vehicles in Maintenance" value={kpis?.vehiclesInMaintenance || 0} accent="text-orange-600 dark:text-orange-400" icon={<Wrench size={18} />} />
        <KpiCard label="Drivers on Duty" value={kpis?.driversOnDuty || 0} accent="text-emerald-600 dark:text-emerald-400" icon={<Users size={18} />} />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <KpiCard label="Fleet Utilization" value={`${kpis?.fleetUtilizationPct || 0}%`} accent="text-sky-600 dark:text-sky-400" icon={<Gauge size={18} />} />
        <KpiCard label="Pending Trips" value={kpis?.pendingTrips || 0} accent="text-blue-600 dark:text-blue-400" icon={<Clock size={18} />} />
        <KpiCard label="Active Vehicles" value={kpis?.activeVehicles || 0} accent="text-emerald-600 dark:text-emerald-400" icon={<Truck size={18} />} />
      </div>

      {/* Charts Row — stacks vertically on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <ChartCard title="Trips per Month">
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5B301" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F5B301" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke={chartTheme.axis} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke={chartTheme.axis} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="trips" stroke="#F5B301" fill="url(#colorTrips)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Fuel Consumption">
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke={chartTheme.axis} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke={chartTheme.axis} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" fill="#F5B301" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Expense Distribution">
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} dataKey="amount" nameKey="category" innerRadius={45} outerRadius={80} paddingAngle={4}>
                  {expenseData.map((entry, index) => (
                    <Cell key={entry.category} fill={['#F5B301', '#38bdf8', '#a78bfa', '#34d399'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Revenue vs Expense + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
        <ChartCard title="Revenue vs Expense">
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke={chartTheme.axis} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke={chartTheme.axis} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="#F5B301" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#38bdf8" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Quick Actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionButton primary icon={<Route size={16} />} onClick={() => window.location.href = '/trips'}>
              Manage Trips
            </ActionButton>
            <ActionButton icon={<FuelIcon size={16} />} onClick={() => window.location.href = '/fuel'}>
              Add Fuel Log
            </ActionButton>
            {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST") && (
              <ActionButton icon={<Receipt size={16} />} onClick={() => window.location.href = '/expenses'}>
                Add Expense
              </ActionButton>
            )}
            <ActionButton icon={<BarChart3 size={16} />} onClick={() => window.location.href = '/reports'}>
              View Reports & ROI
            </ActionButton>
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <div className="xl:col-span-2 min-w-0">
          <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-4 sm:p-5">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Recent Trips</p>
            {recentTrips.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <Table columns={columns} data={recentTrips} />
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No recent trips logged.</div>
            )}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5 min-w-0">
          <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-4 sm:p-5">
            <p className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Latest Fuel Logs</p>
            <div className="space-y-3">
              {recentFuel.length > 0 ? (
                recentFuel.map((log) => (
                  <div key={log.id} className="rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-[#111827] p-3 sm:p-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="truncate">Vehicle: {log.vehicleId}</span>
                      <span className="shrink-0 ml-2">{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-900 dark:text-white truncate">
                      Station: {log.station} · {log.liters}L · ₹{log.cost.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No fuel logs logged.</div>
              )}
            </div>
          </div>

          {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST") && (
            <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-4 sm:p-5">
              <p className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Latest Expenses</p>
              <div className="space-y-3">
                {recentExp.length > 0 ? (
                  recentExp.map((expense) => (
                    <div key={expense.id} className="rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-[#111827] p-3 sm:p-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span className="truncate">{expense.type}</span>
                        <span className="shrink-0 ml-2">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-900 dark:text-white truncate">
                        Vehicle: {expense.vehicleId} · ₹{expense.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No recent expenses logged.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}