import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy load pages
const DashboardPage = React.lazy(() => import("../pages/DashboardPage"));
const AuthForm = React.lazy(() => import("../components/AuthForm"));
const TripsPage = React.lazy(() => import("../pages/TripsPage"));
const FuelPage = React.lazy(() => import("../pages/FuelPage"));
const ExpensesPage = React.lazy(() => import("../pages/ExpensesPage"));
const ReportsPage = React.lazy(() => import("../pages/ReportsPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <AuthForm />,
      },
      {
        path: "auth",
        element: <AuthForm />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "trips",
        element: (
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "fuel",
        element: (
          <ProtectedRoute>
            <FuelPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "expenses",
        element: (
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;