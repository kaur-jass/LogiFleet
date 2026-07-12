import API from '../api/axios';

export const getFleetSummary = async () => {
  return API.get('/reports/fleet-summary').then((res) => res.data);
};

export const getVehicleReport = async (id) => {
  return API.get(`/reports/vehicle/${id}`).then((res) => res.data);
};

export const exportReportCsv = async () => {
  return API.get('/reports/export.csv').then((res) => res.data);
};
