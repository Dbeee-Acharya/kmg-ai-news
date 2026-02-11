import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/user-api.js";

export const useReportersQuery = () => {
  const reportersQuery = useQuery({
    queryKey: ["reporters"],
    queryFn: userApi.getAll,
  });

  return {
    reporters: reportersQuery.data,
    isLoading: reportersQuery.isLoading,
    isError: reportersQuery.isError,
  };
};
