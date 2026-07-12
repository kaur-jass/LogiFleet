// src/components/driver/EditDriver.jsx
import { X, UserCog } from "lucide-react";
import DriverForm from "./DriverForm";

/**
 * EditDriver
 * ----------------------------------------------------
 * Responsive modal used by DriverPageContent to edit an existing
 * driver. Fully controlled by the parent via `isOpen` / `driver` /
 * `onClose`. Mock-only: no backend call, onSave hands data back up.
 * ----------------------------------------------------
 */
const EditDriver = ({ isOpen, driver, onClose, onSave }) => {
  if (!isOpen) return null;

  const handleSubmit = (formData) => {
    onSave?.(formData);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-200 dark:border-gray-800 dark:bg-[#1F2937]"
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-300">
              <UserCog size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Edit Driver
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {driver ? driver.name : "Driver record"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 py-5">
          {driver ? (
            <DriverForm
              initialData={driver}
              onSubmit={handleSubmit}
              onCancel={onClose}
              submitLabel="Update Driver"
            />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Driver record not found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDriver;