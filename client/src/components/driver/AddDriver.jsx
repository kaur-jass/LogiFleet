// src/components/driver/AddDriver.jsx
import { X, UserPlus } from "lucide-react";
import DriverForm from "./DriverForm";

/**
 * AddDriver
 * ----------------------------------------------------
 * Responsive modal used by DriverPageContent to create a new
 * driver. Fully controlled by the parent via `isOpen` / `onClose`.
 * Mock-only: no backend call, onSave just hands data back up.
 * ----------------------------------------------------
 */
const AddDriver = ({ isOpen, onClose, onSave }) => {
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
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Add Driver
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Create a new driver record
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
          <DriverForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel="Save Driver"
          />
        </div>
      </div>
    </div>
  );
};

export default AddDriver;