// src/components/driver/DriverPageContent.jsx
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Plus,
  Users,
  CheckCircle2,
  Truck,
  Ban,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import DriverTable from "./DriverTable";
import AddDriver from "./AddDriver";
import EditDriver from "./EditDriver";

/**
 * DriverPageContent
 * ----------------------------------------------------
 * Driver Management page content. Same design system as the
 * Vehicle Registry: KPI cards, business rule banner, toolbar
 * (search/filters/actions), and a data table with pagination.
 *
 * Add / Edit are rendered as controlled modals (AddDriver /
 * EditDriver) driven by local state — no nested routing needed.
 * ----------------------------------------------------
 */

const mockDrivers = [
  {
    id: "DRV-001",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@logifleet.com",
    phone: "+91 98765 43210",
    licenseNumber: "DL-10239485",
    licenseCategory: "HMV",
    licenseExpiry: "2026-09-14",
    emergencyContact: "+91 98111 22334",
    address: "221 Sector 32, Ludhiana, Punjab",
    tripCompletion: 96,
    safetyStatus: "Excellent",
    currentStatus: "On Trip",
  },
  {
    id: "DRV-002",
    name: "Suresh Yadav",
    email: "suresh.yadav@logifleet.com",
    phone: "+91 98220 11223",
    licenseNumber: "DL-88213765",
    licenseCategory: "LMV",
    licenseExpiry: "2026-08-02",
    emergencyContact: "+91 90123 45678",
    address: "45 Model Town, Jalandhar, Punjab",
    tripCompletion: 88,
    safetyStatus: "Good",
    currentStatus: "Available",
  },
  {
    id: "DRV-003",
    name: "Manpreet Singh",
    email: "manpreet.singh@logifleet.com",
    phone: "+91 99888 76543",
    licenseNumber: "DL-55019284",
    licenseCategory: "HMV",
    licenseExpiry: "2026-07-30",
    emergencyContact: "+91 99001 23456",
    address: "12 Civil Lines, Ludhiana, Punjab",
    tripCompletion: 74,
    safetyStatus: "Average",
    currentStatus: "Suspended",
  },
  {
    id: "DRV-004",
    name: "Amit Sharma",
    email: "amit.sharma@logifleet.com",
    phone: "+91 97654 32109",
    licenseNumber: "DL-33984521",
    licenseCategory: "PSV",
    licenseExpiry: "2027-01-19",
    emergencyContact: "+91 98876 54321",
    address: "78 Rajguru Nagar, Ludhiana, Punjab",
    tripCompletion: 91,
    safetyStatus: "Excellent",
    currentStatus: "Available",
  },
  {
    id: "DRV-005",
    name: "Harpreet Kaur",
    email: "harpreet.kaur@logifleet.com",
    phone: "+91 96543 21098",
    licenseNumber: "DL-77102938",
    licenseCategory: "LMV",
    licenseExpiry: "2026-06-25",
    emergencyContact: "+91 97001 65432",
    address: "9 Sarabha Nagar, Ludhiana, Punjab",
    tripCompletion: 65,
    safetyStatus: "Poor",
    currentStatus: "Off Duty",
  },
  {
    id: "DRV-006",
    name: "Vikram Chauhan",
    email: "vikram.chauhan@logifleet.com",
    phone: "+91 95432 10987",
    licenseNumber: "DL-64920175",
    licenseCategory: "Trailer",
    licenseExpiry: "2026-11-05",
    emergencyContact: "+91 96112 23345",
    address: "56 Gill Road, Ludhiana, Punjab",
    tripCompletion: 83,
    safetyStatus: "Good",
    currentStatus: "On Trip",
  },
  {
    id: "DRV-007",
    name: "Deepak Verma",
    email: "deepak.verma@logifleet.com",
    phone: "+91 94321 09876",
    licenseNumber: "DL-20938471",
    licenseCategory: "HMV",
    licenseExpiry: "2026-07-22",
    emergencyContact: "+91 95223 34456",
    address: "3 Ferozepur Road, Ludhiana, Punjab",
    tripCompletion: 79,
    safetyStatus: "Good",
    currentStatus: "Available",
  },
  {
    id: "DRV-008",
    name: "Karamjeet Singh",
    email: "karamjeet.singh@logifleet.com",
    phone: "+91 93210 98765",
    licenseNumber: "DL-11029384",
    licenseCategory: "PSV",
    licenseExpiry: "2025-12-30",
    emergencyContact: "+91 94334 45567",
    address: "67 Dugri Road, Ludhiana, Punjab",
    tripCompletion: 58,
    safetyStatus: "Average",
    currentStatus: "Suspended",
  },
];

const LICENSE_CATEGORY_OPTIONS = ["All Categories", "LMV", "HMV", "MCWG", "PSV", "Trailer"];
const STATUS_OPTIONS = ["All Statuses", "Available", "On Trip", "Off Duty", "Suspended"];
const PAGE_SIZE = 5;

const KpiCard = ({ label, value, icon: Icon, accent }) => (
  <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-[#1F2937]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${accent}`}
      >
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const DriverPageContent = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Simulate initial fetch
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDrivers(mockDrivers);
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setDrivers(mockDrivers);
      setLoading(false);
    }, 600);
  };

  const handleExportCsv = () => {
    const headers = [
      "Name",
      "License Number",
      "License Category",
      "License Expiry",
      "Phone",
      "Trip Completion",
      "Safety Status",
      "Current Status",
    ];
    const rows = filteredDrivers.map((d) => [
      d.name,
      d.licenseNumber,
      d.licenseCategory,
      d.licenseExpiry,
      d.phone,
      `${d.tripCompletion}%`,
      d.safetyStatus,
      d.currentStatus,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "drivers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (driver) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
  };

  const handleAddSave = (formData) => {
    const newDriver = { ...formData, id: `DRV-${Date.now()}` };
    setDrivers((prev) => [newDriver, ...prev]);
  };

  const handleEditSave = (formData) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === editingDriver.id ? { ...d, ...formData } : d))
    );
  };

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(search.toLowerCase()) ||
        driver.licenseNumber.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All Categories" ||
        driver.licenseCategory === categoryFilter;
      const matchesStatus =
        statusFilter === "All Statuses" ||
        driver.currentStatus === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [drivers, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrivers.length / PAGE_SIZE)
  );
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const kpis = useMemo(
    () => ({
      total: drivers.length,
      available: drivers.filter((d) => d.currentStatus === "Available")
        .length,
      onTrip: drivers.filter((d) => d.currentStatus === "On Trip").length,
      suspended: drivers.filter((d) => d.currentStatus === "Suspended")
        .length,
    }),
    [drivers]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Driver Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage driver records, licenses and safety compliance.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:bg-yellow-300 hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={17} />
          Add Driver
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Drivers"
          value={kpis.total}
          icon={Users}
          accent="bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300"
        />
        <KpiCard
          label="Available"
          value={kpis.available}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <KpiCard
          label="On Trip"
          value={kpis.onTrip}
          icon={Truck}
          accent="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <KpiCard
          label="Suspended"
          value={kpis.suspended}
          icon={Ban}
          accent="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        />
      </div>

      {/* Business Rule Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
        <AlertTriangle
          size={19}
          className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
        />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Assignment rules</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-700 dark:text-amber-400/90">
            <li>Expired licenses cannot be assigned.</li>
            <li>Suspended drivers cannot be assigned.</li>
            <li>Drivers already on trips cannot be assigned again.</li>
          </ul>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1F2937] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-1">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or license..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 transition-all duration-200 focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>

          {/* License Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-3 pr-8 text-sm text-gray-700 transition-all duration-200 focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 sm:w-auto"
            >
              {LICENSE_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Driver Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-3 pr-8 text-sm text-gray-700 transition-all duration-200 focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 sm:w-auto"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <DriverTable
        drivers={paginatedDrivers}
        loading={loading}
        onView={(driver) => setEditingDriver(driver)}
        onEdit={(driver) => setEditingDriver(driver)}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredDrivers.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      <AddDriver
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddSave}
      />
      <EditDriver
        isOpen={!!editingDriver}
        driver={editingDriver}
        onClose={() => setEditingDriver(null)}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default DriverPageContent;