// src/pages/DriverPage.jsx
import DriverPageContent from "../components/driver/DriverPageContent";

/**
 * DriverPage
 * ----------------------------------------------------
 * Route-level wrapper for the Driver Management module.
 * Rendered inside DashboardLayout's <Outlet /> (e.g. at "/drivers").
 * Kept thin on purpose, in line with DashboardPage / ExpensesPage /
 * FuelPage / ReportsPage / TripsPage — all business logic and UI
 * live in the matching *PageContent component.
 * ----------------------------------------------------
 */
const DriverPage = () => {
  return <DriverPageContent />;
};

export default DriverPage;