import React, { useState, useRef, useEffect } from 'react';
import API from "../api/axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  User,
  ChevronDown,
  UserCog,
  AlertCircle,
  Truck,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import logo from "../assets/logo.png";
import truck from "../assets/truck.png";

// Role options: label shown to the user, value sent to the backend
const ROLE_OPTIONS = [
  { label: "Fleet Manager", value: "FLEET_MANAGER" },
  { label: "Driver", value: "DRIVER" },
  { label: "Safety Officer", value: "SAFETY_OFFICER" },
  { label: "Financial Analyst", value: "FINANCIAL_ANALYST" },
];

export default function AuthForm({ 
  isDarkMode: propIsDarkMode, 
  setIsDarkMode: propSetIsDarkMode, 
  isRegister: propIsRegister, 
  setIsRegister: propSetIsRegister 
}) {
  // Local state fallbacks in case props are not passed by react-router-dom
  const [localDarkMode, setLocalDarkMode] = useState(true);
  const [localRegister, setLocalRegister] = useState(false);

  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : localDarkMode;
  const setIsDarkMode = propSetIsDarkMode || setLocalDarkMode;
  const isRegister = propIsRegister !== undefined ? propIsRegister : localRegister;
  const setIsRegister = propSetIsRegister || setLocalRegister;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!formData.role) {
      setError("Please select a role to continue.");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isRegister) {
        response = await API.post("/auth/register", {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      } else {
        response = await API.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
      }

      if (!isRegister) {
        const { token, user } = response.data.data;
        const resolvedRole = user.role || formData.role;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", resolvedRole);

        // Redirect to /dashboard as all views are rendered under AppLayout children
        window.location.href = "/dashboard";
        return;
      }

      alert("Account created successfully! Please login.");

      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "",
      });

      setIsRegister(false);

      console.log(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-6xl rounded-[24px] border overflow-hidden flex flex-col md:flex-row relative min-h-[680px] transition-all duration-300 ${
      isDarkMode
        ? 'bg-[#111827] border-slate-800 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]'
        : 'bg-white border-slate-200 shadow-[0_32px_64px_-15px_rgba(15,23,42,0.08)]'
    }`}>

      {/* ================= THEME TOGGLE BUTTON ================= */}
      <div className={`absolute top-6 right-8 z-30 hidden md:flex items-center rounded-full p-1 border transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setIsDarkMode(false)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            !isDarkMode
              ? 'bg-white text-[#B8860B] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sun size={13} className="stroke-[2.5]" /> Light
        </button>
        <button
          type="button"
          onClick={() => setIsDarkMode(true)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            isDarkMode
              ? 'bg-[#1e293b] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Moon size={13} className="stroke-[2.5]" /> Dark
        </button>
      </div>

      {/* ================= LEFT SIDE: LOGIFLEET BRAND PANEL ================= */}
      <div className="hidden md:flex w-full md:w-1/2 p-8 md:p-14 flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#FBC02D] to-[#F5B301]">

        {/* Decorative city skyline silhouette */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-10">
          <svg viewBox="0 0 600 160" className="w-full h-full" preserveAspectRatio="none">
            <rect x="0" y="60" width="40" height="100" fill="#111" />
            <rect x="50" y="30" width="35" height="130" fill="#111" />
            <rect x="95" y="80" width="30" height="80" fill="#111" />
            <rect x="480" y="40" width="35" height="120" fill="#111" />
            <rect x="525" y="70" width="30" height="90" fill="#111" />
            <rect x="560" y="20" width="35" height="140" fill="#111" />
          </svg>
        </div>

        {/* Decorative map pin + route */}
        <div className="pointer-events-none absolute top-24 left-8 w-48 h-48 opacity-15">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              d="M100 10c-33 0-60 27-60 60 0 45 60 120 60 120s60-75 60-120c0-33-27-60-60-60z"
              fill="#111"
            />
            <circle cx="100" cy="70" r="22" fill="#FBC02D" />
            <path
              d="M120 90 C 180 100, 190 60, 250 70"
              stroke="#111"
              strokeWidth="3"
              strokeDasharray="6 6"
              fill="none"
            />
          </svg>
        </div>

        {/* Branding */}
        <div className="z-10">
          <div className="flex items-center gap-2 mb-8">
            <img src={logo} alt="LogiFleet logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg text-neutral-900">LogiFleet</span>
          </div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-800/80 mb-2">
            SMART TRANSPORT OPERATIONS
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-none">
            LOGIFLEET
          </h1>
          <p className="mt-3 text-neutral-800/90 text-base md:text-lg">
            Drive <span className="mx-1 text-neutral-800/50">•</span> Manage{" "}
            <span className="mx-1 text-neutral-800/50">•</span> Deliver
          </p>
        </div>

        {/* Truck image */}
        <div className="relative z-10 flex-1 flex items-end justify-center py-6">
          <img
            src={truck}
            alt="LogiFleet delivery truck"
            className="w-full max-w-[220px] lg:max-w-md object-contain drop-shadow-2xl"
          />
        </div>

        {/* Feature chips */}
        <div className="relative z-10 grid grid-cols-3 gap-2 lg:gap-3">
          <FeatureChip icon={<Truck size={18} />} label={"Optimized\nFleet"} />
          <FeatureChip icon={<ShieldCheck size={18} />} label={"Safe &\nCompliant"} />
          <FeatureChip icon={<BarChart3 size={18} />} label={"Data Driven\nInsights"} />
        </div>
      </div>

      {/* ================= RIGHT SIDE: FORM ================= */}
      <div className={`w-full md:w-1/2 p-6 sm:p-12 md:p-16 flex flex-col justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-[#111827]' : 'bg-white'
      }`}>
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile-only logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <img src={logo} alt="LogiFleet logo" className="h-8 w-8 object-contain" />
            <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>LogiFleet</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h3 className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {isRegister ? 'Create your account' : 'Welcome Back'}
            </h3>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {isRegister ? 'Set up your LogiFleet account to get started' : 'Login to your account and continue'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isRegister && (
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter Your Name"
                    required
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}

            <RoleSelect value={formData.role} onChange={handleRoleChange} isDarkMode={isDarkMode} />

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Form Settings Options */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className={`flex items-center gap-2 cursor-pointer select-none transition-colors duration-300 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-[#F5B301] accent-[#F5B301]" />
                {isRegister ? 'Accept terms' : 'Remember me'}
              </label>
              {!isRegister && (
                <a href="#forgot" className="font-semibold text-[#B8860B] hover:underline transition-colors">Forgot password?</a>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Call To Action Buttons */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#F5B301] hover:bg-[#e0a400] text-neutral-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md group active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
              {!loading && (
                <ArrowRight
                  size={14}
                  className="transform group-hover:translate-x-0.5 transition-transform"
                />
              )}
            </button>
          </form>

          {/* Secure Divider */}
          <div className="relative flex items-center my-6">
            <div className={`flex-grow border-t transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
            <span className={`flex-shrink mx-3 text-[9px] font-bold tracking-widest uppercase transition-colors duration-300 ${
              isDarkMode ? 'text-slate-600' : 'text-slate-400'
            }`}>Secure Connection</span>
            <div className={`flex-grow border-t transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
          </div>

          {/* Alternative Switching Toggle */}
          <p className={`text-center text-xs font-normal transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setError("");
                setFormData({
                  fullName: "",
                  email: "",
                  password: "",
                  role: "",
                });
                setIsRegister(!isRegister);
              }}
              className="font-bold text-[#B8860B] hover:underline ml-0.5 transition-colors"
            >
              {isRegister ? 'Log in' : 'Create account'}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}

/**
 * RoleSelect — custom dropdown styled to match the Email/Password inputs exactly:
 * same border, height, rounded corners, focus ring and yellow accent, in both themes.
 */
function RoleSelect({ value, onChange, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = ROLE_OPTIONS.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((o) => !o);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 transition-colors duration-300 ${
        isDarkMode ? 'text-slate-500' : 'text-slate-400'
      }`}>
        Role <span className="text-[#B8860B] normal-case">*</span>
      </label>

      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        required
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#F5B301]/40 transition-all ${
          isOpen ? "border-[#F5B301] ring-2 ring-[#F5B301]/40" : ""
        } ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-slate-50 border-slate-200 text-slate-900"
        } ${selected ? "" : isDarkMode ? "text-slate-600" : "text-slate-400"}`}
      >
        {selected ? selected.label : "Select your role"}
      </button>

      <span className="pointer-events-none absolute left-0 top-[38px] flex items-center pl-4 text-slate-400 dark:text-slate-500">
        <UserCog size={15} />
      </span>
      <ChevronDown
        size={15}
        className={`pointer-events-none absolute right-3.5 top-[42px] text-slate-400 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />

      {isOpen && (
        <ul
          role="listbox"
          className={`absolute z-20 mt-2 w-full rounded-xl border shadow-lg py-1.5 max-h-60 overflow-auto ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          {ROLE_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                value === opt.value
                  ? isDarkMode
                    ? "bg-[#F5B301]/20 text-white font-semibold"
                    : "bg-[#FDE9A8]/60 text-neutral-900 font-semibold"
                  : isDarkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeatureChip({ icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-[#FDE9A8]/70 rounded-2xl px-3 py-2.5">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F5B301]/40 text-neutral-900 shrink-0">
        {icon}
      </span>
      <span className="text-[11px] font-semibold text-neutral-800 leading-tight whitespace-pre-line">
        {label}
      </span>
    </div>
  );
}