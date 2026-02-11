import { api } from "../lib/axios.js";

export const tagsApi = {
  getAll: async () => {
    const { data } = await api.get("/tags");
    return data;
  },
  create: async (name: string) => {
    const { data } = await api.post("/tags", { name });
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/tags/${id}`);
    return data;
  },
};
