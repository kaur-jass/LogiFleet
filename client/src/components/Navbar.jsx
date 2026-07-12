import { Search, Bell, SunMoon } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-slate-100 p-3 text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
            <Search className="h-4 w-4" />
          </div>
          <input
            placeholder="Search reports, trips, fuel logs..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="rounded-3xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <SunMoon className="h-5 w-5" />
          </button>
          <button className="rounded-3xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </button> */}
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Jordan</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Operations Lead</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
