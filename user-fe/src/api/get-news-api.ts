import { api } from "../lib/axios";

export const newsApi = {
  getNews: async (page: number = 0, platform?: string) => {
    const { data } = await api.get("/api/news", {
      params: { page, platform },
    });
    return data;
  },

  searchNews: async (query: string) => {
    const { data } = await api.get("/api/news/search", {
      params: { q: query },
    });
    return data;
  },

  getNewsBySlug: async (slug: string) => {
    const { data } = await api.get(`/api/news/${slug}`);
    return data;
  },
};
