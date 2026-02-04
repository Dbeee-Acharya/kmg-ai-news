import { api } from "../lib/axios.js";

export const logsApi = {
  getLogs: async () => {
    const { data } = await api.get("/logs");
    return data;
  },
};
