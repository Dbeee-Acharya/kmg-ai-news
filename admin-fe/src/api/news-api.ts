import { api } from "../lib/axios.js";

export const newsApi = {
  getAll: async () => {
    const { data } = await api.get("/news");
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/news/${id}`);
    return data;
  },
  create: async (newsData: any) => {
    const { data } = await api.post("/news", newsData);
    return data;
  },
  update: async (id: string, newsData: any) => {
    const { data } = await api.put(`/news/${id}`, newsData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/news/${id}`);
    return data;
  },
};
