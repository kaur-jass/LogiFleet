import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import AuthForm from '../components/AuthForm';
import TripsPage from '../pages/TripsPage';
import FuelPage from '../pages/FuelPage';
import ExpensesPage from '../pages/ExpensesPage';
import ReportsPage from '../pages/ReportsPage';
import DriverPage from "../pages/DriverPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <AuthForm /> },
      { path: 'auth', element: <AuthForm /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'drivers', element: <DriverPage /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'fuel', element: <FuelPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);

export default router;
