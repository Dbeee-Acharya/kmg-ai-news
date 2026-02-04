import { api } from '../lib/axios';

export const userApi = {
  getAll: async () => {
    const { data } = await api.get('/auth/reporters');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/auth/reporters/${id}`);
    return data;
  },
  create: async (userData: any) => {
    const { data } = await api.post('/auth/reporters', userData);
    return data;
  },
  update: async (id: string, userData: any) => {
    const { data } = await api.put(`/auth/reporters/${id}`, userData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/auth/reporters/${id}`);
    return data;
  },
};
