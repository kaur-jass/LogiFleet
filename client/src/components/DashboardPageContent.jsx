import { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import Card from './Card';
import Button from './Button';
import ChartContainer from './ChartContainer';
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

export default function DashboardPageContent() {
  const [kpis, setKpis] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentFuel, setRecentFuel] = useState([]);
  const [recentExp, setRecentExp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  const chartData = useMemo(() => dashboardKpis.tripsPerMonth, []);
  const fuelData = useMemo(() => dashboardKpis.fuelConsumption, []);
  const expenseData = useMemo(() => dashboardKpis.expenseDistribution, []);
  const revenueData = useMemo(() => dashboardKpis.revenueExpense, []);

  useEffect(() => {
    async function loadData() {
      try {
        const userRole = localStorage.getItem("role");
        setRole(userRole);

        // Fetch KPIs
        const kpiRes = await getDashboardKpis();
        setKpis(kpiRes.data);

        // Fetch Trips
        const tripsRes = await getTrips();
        setRecentTrips(tripsRes.data?.slice(0, 5) || []);

        // Fetch Fuel Logs
        const fuelRes = await getFuelLogs();
        setRecentFuel(fuelRes.data?.slice(0, 5) || []);

        // Fetch Expenses if allowed
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
      <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-500">
        Loading fleet dashboard...
      </div>
    );
  }

  const totalVehicles = (kpis?.activeVehicles || 0) + (kpis?.availableVehicles || 0) + (kpis?.vehiclesInMaintenance || 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-4">
        <Card title="Total Vehicles" value={totalVehicles.toString()} />
        <Card title="Active Trips" value={(kpis?.activeTrips || 0).toString()} />
        <Card title="Vehicles in Maintenance" value={(kpis?.vehiclesInMaintenance || 0).toString()} />
        <Card title="Drivers on Duty" value={(kpis?.driversOnDuty || 0).toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Fleet Utilization" value={`${kpis?.fleetUtilizationPct || 0}%`} />
        <Card title="Pending Trips" value={(kpis?.pendingTrips || 0).toString()} />
        <Card title="Active Vehicles" value={(kpis?.activeVehicles || 0).toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartContainer title="Trips per Month">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="trips" stroke="#0ea5e9" fill="url(#colorTrips)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Fuel Consumption">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="liters" fill="#0ea5e9" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Expense Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {expenseData.map((entry, index) => (
                    <Cell key={entry.category} fill={['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartContainer title="Revenue vs Expense">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} />
                <Line type="monotone" dataKey="expense" stroke="#0f766e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Quick Actions">
          <div className="space-y-4">
            <Button className="w-full" onClick={() => window.location.href = '/trips'}>Manage Trips</Button>
            <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => window.location.href = '/fuel'}>Add Fuel Log</Button>
            {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST") && (
              <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => window.location.href = '/expenses'}>Add Expense</Button>
            )}
            <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => window.location.href = '/reports'}>View Reports & ROI</Button>
          </div>
        </ChartContainer>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Recent Trips">
            {recentTrips.length > 0 ? (
              <Table columns={columns} data={recentTrips} />
            ) : (
              <div className="p-4 text-sm text-slate-500">No recent trips logged.</div>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Latest Fuel Logs">
            <div className="space-y-3">
              {recentFuel.length > 0 ? (
                recentFuel.map((log) => (
                  <div key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Vehicle: {log.vehicleId}</span>
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 text-slate-900 dark:text-white">Station: {log.station} · {log.liters}L · ₹{log.cost.toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-500">No fuel logs logged.</div>
              )}
            </div>
          </Card>
          {(role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST") && (
            <Card title="Latest Expenses">
              <div className="space-y-3">
                {recentExp.length > 0 ? (
                  recentExp.map((expense) => (
                    <div key={expense.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>{expense.type}</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 text-slate-900 dark:text-white">Vehicle: {expense.vehicleId} · ₹{expense.amount.toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-slate-500">No recent expenses logged.</div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
