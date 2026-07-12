import API from '../api/axios';

export const getDashboardKpis = async () => {
  return API.get('/dashboard/kpis').then((res) => res.data);
};

export const getDashboardTotals = async () => {
  return {
    totalTrips: 13124,
    activeTrips: 128,
    fuelCost: 21450,
    maintenanceCost: 8420,
    totalExpenses: 29870,
    revenue: 174500,
    vehicleRoi: '12.3%',
  };
};
