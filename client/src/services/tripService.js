import API from '../api/axios';

export const getTrips = async () => {
  return API.get('/trips').then((res) => res.data);
};

export const createTrip = async (payload) => {
  return API.post('/trips', payload).then((res) => res.data);
};

export const dispatchTrip = async (id) => {
  return API.post(`/trips/${id}/dispatch`).then((res) => res.data);
};

export const completeTrip = async (id, payload) => {
  return API.post(`/trips/${id}/complete`, payload).then((res) => res.data);
};

export const cancelTrip = async (id) => {
  return API.post(`/trips/${id}/cancel`).then((res) => res.data);
};
