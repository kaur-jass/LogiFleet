import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

// Lazy load route pages to support React Suspense boundaries
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const AuthForm = React.lazy(() => import('../components/AuthForm'));
const TripsPage = React.lazy(() => import('../pages/TripsPage'));
const FuelPage = React.lazy(() => import('../pages/FuelPage'));
const ExpensesPage = React.lazy(() => import('../pages/ExpensesPage'));
const ReportsPage = React.lazy(() => import('../pages/ReportsPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <AuthForm /> },
      { path: 'auth', element: <AuthForm /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'fuel', element: <FuelPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);

export default router;
