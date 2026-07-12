// src/components/driver/DriverTable.jsx
import {
  CircleUserRound,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

/**
 * DriverTable
 * ----------------------------------------------------
 * Presentational table for the Driver Registry.
 * Mirrors the Vehicle Registry table: sticky header, hover rows,
 * loading skeleton, empty state, pagination, horizontal scroll on mobile.
 *
 * Props
 *  - drivers: array of driver records (already filtered + paginated slice)
 *  - loading: boolean
 *  - onView / onEdit / onDelete: (driver) => void
 *  - currentPage, totalPages, totalItems, pageSize
 *  - onPageChange: (page) => void
 * ----------------------------------------------------
 */

const SAFETY_STYLES = {
  Excellent:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  Good: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  Average:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  Poor: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const STATUS_STYLES = {
  Available:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  "On Trip": "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  "Off Duty":
    "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300",
  Suspended: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const TABLE_COLUMNS = [
  "Driver",
  "License Number",
  "License Category",
  "License Expiry",
  "Phone Number",
  "Trip Completion",
  "Safety Status",
  "Current Status",
  "Actions",
];

const Badge = ({ label, styles }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
      styles[label] ||
      "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300"
    }`}
  >
    {label}
  </span>
);

const SkeletonRow = () => (
  <tr className="border-b border-gray-100 dark:border-gray-800">
    {TABLE_COLUMNS.map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 w-full max-w-[120px] animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
      </td>
    ))}
  </tr>
);

const isExpiringSoon = (dateStr) => {
  const expiry = new Date(dateStr);
  const now = new Date();
  const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
  return diffDays < 60;
};

const DriverTable = ({
  drivers = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1F2937]">
      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/60">
            <tr>
              {TABLE_COLUMNS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && drivers.length === 0 && (
              <tr>
                <td colSpan={TABLE_COLUMNS.length} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                      <Inbox size={22} />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      No drivers found
                    </p>
                    <p className="max-w-xs text-xs text-gray-400 dark:text-gray-500">
                      Try adjusting your search or filters, or add a new
                      driver to get started.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              drivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="border-b border-gray-100 transition-colors duration-150 last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                >
                  {/* Driver */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-300">
                        <CircleUserRound size={20} />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {driver.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {driver.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* License Number */}
                  <td className="whitespace-nowrap px-4 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                    {driver.licenseNumber}
                  </td>

                  {/* License Category */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-gray-600 dark:text-gray-400">
                    {driver.licenseCategory}
                  </td>

                  {/* License Expiry */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={
                        isExpiringSoon(driver.licenseExpiry)
                          ? "font-medium text-red-500 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                      }
                    >
                      {driver.licenseExpiry}
                    </span>
                  </td>

                  {/* Phone Number */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-gray-600 dark:text-gray-400">
                    {driver.phone}
                  </td>

                  {/* Trip Completion % */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                          style={{ width: `${driver.tripCompletion}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {driver.tripCompletion}%
                      </span>
                    </div>
                  </td>

                  {/* Safety Status */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <Badge label={driver.safetyStatus} styles={SAFETY_STYLES} />
                  </td>

                  {/* Current Status */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <Badge label={driver.currentStatus} styles={STATUS_STYLES} />
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView?.(driver)}
                        title="View driver"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit?.(driver)}
                        title="Edit driver"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-400/10 dark:hover:text-yellow-300"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete?.(driver)}
                        title="Delete driver"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3.5 dark:border-gray-800 sm:flex-row">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {startItem}-{endItem}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {totalItems}
            </span>{" "}
            drivers
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors duration-150 ${
                  page === currentPage
                    ? "bg-yellow-400 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                onPageChange?.(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTable;