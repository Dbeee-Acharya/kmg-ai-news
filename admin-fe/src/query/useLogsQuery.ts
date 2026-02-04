import { useQuery } from "@tanstack/react-query";
import { logsApi } from "../api/logs-api.js";

export const useLogsQuery = () => {
  return useQuery({
    queryKey: ["logs"],
    queryFn: logsApi.getLogs,
    // Logs might be frequent, maybe poll every 30s?
    refetchInterval: 30000,
  });
};
