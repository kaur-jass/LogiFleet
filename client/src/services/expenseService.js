import API from '../api/axios';

export const getExpenses = async () => {
  return API.get('/expenses').then((res) => res.data);
};

export const createExpense = async (payload) => {
  return API.post('/expenses', payload).then((res) => res.data);
};
