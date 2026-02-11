import { api } from "../lib/axios.js";

export interface NewsFilterParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  sortOrder?: "asc" | "desc";
}

export const newsApi = {
  getAll: async (filters: NewsFilterParams = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.tags && filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    const { data } = await api.get(`/news?${params.toString()}`);
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
  addAuthor: async (newsId: string, userId: string) => {
    const { data } = await api.post(`/news/${newsId}/authors`, { userId });
    return data;
  },
  removeAuthor: async (newsId: string, userId: string) => {
    const { data } = await api.delete(`/news/${newsId}/authors/${userId}`);
    return data;
  },
  uploadOgImage: async (newsId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/news/${newsId}/og-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
