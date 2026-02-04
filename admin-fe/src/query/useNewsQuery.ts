import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsApi } from "../api/news-api.js";
import { api } from "../lib/axios.js";

export const useNewsQuery = () => {
  const queryClient = useQueryClient();

  const newsQuery = useQuery({
    queryKey: ["news"],
    queryFn: newsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: newsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => newsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: newsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
  });

  const useNewsItemQuery = (id: string | undefined) => useQuery({
    queryKey: ["news", id],
    queryFn: () => newsApi.getById(id!),
    enabled: !!id && id !== 'add-news',
  });

  return {
    news: newsQuery.data,
    isLoading: newsQuery.isLoading,
    isError: newsQuery.isError,
    useNewsItemQuery,
    createNews: createMutation.mutateAsync,
    updateNews: updateMutation.mutateAsync,
    deleteNews: deleteMutation.mutateAsync,
    uploadMedia: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
  };
};
