import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth-api.js";
import { useAuth } from "../context/AuthContext.js";

export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const { login: setAuth, logout: performLogout } = useAuth();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.token);
      queryClient.invalidateQueries();
    },
  });

  const createReporterMutation = useMutation({
    mutationFn: authApi.createReporter,
    onSuccess: () => {
      // Potentially invalidate reporters list if we had one
    },
  });

  const logout = () => {
    performLogout();
    queryClient.clear();
  };

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    createReporter: createReporterMutation.mutateAsync,
    isCreatingReporter: createReporterMutation.isPending,
    logout,
  };
};
