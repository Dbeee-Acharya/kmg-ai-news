import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "../api/tags-api.js";

export const useTagsQuery = () => {
  const queryClient = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: tagsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tagsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  return {
    tags: tagsQuery.data,
    isLoading: tagsQuery.isLoading,
    isError: tagsQuery.isError,
    createTag: createMutation.mutateAsync,
    deleteTag: deleteMutation.mutateAsync,
  };
};
