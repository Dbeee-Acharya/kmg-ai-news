import { api } from "../lib/axios.js";

export const authApi = {
  login: async (credentials: any) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },
  createReporter: async (reporterData: any) => {
    const { data } = await api.post("/auth/reporters", reporterData);
    return data;
  },
};
