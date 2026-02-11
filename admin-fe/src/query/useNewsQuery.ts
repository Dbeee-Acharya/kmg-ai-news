import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsApi, type NewsFilterParams } from "../api/news-api.js";
import { api } from "../lib/axios.js";

export const useNewsQuery = (filters: NewsFilterParams = {}) => {
  const queryClient = useQueryClient();

  const newsQuery = useQuery({
    queryKey: ["news", filters],
    queryFn: () => newsApi.getAll(filters),
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

  const addAuthorMutation = useMutation({
    mutationFn: ({ newsId, userId }: { newsId: string; userId: string }) =>
      newsApi.addAuthor(newsId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const removeAuthorMutation = useMutation({
    mutationFn: ({ newsId, userId }: { newsId: string; userId: string }) =>
      newsApi.removeAuthor(newsId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const uploadOgImageMutation = useMutation({
    mutationFn: ({ newsId, file }: { newsId: string; file: File }) =>
      newsApi.uploadOgImage(newsId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  return {
    newsData: newsQuery.data,
    news: newsQuery.data?.data,
    total: newsQuery.data?.total || 0,
    totalPages: newsQuery.data?.totalPages || 0,
    currentPage: newsQuery.data?.page || 1,
    isLoading: newsQuery.isLoading,
    isError: newsQuery.isError,
    useNewsItemQuery,
    createNews: createMutation.mutateAsync,
    updateNews: updateMutation.mutateAsync,
    deleteNews: deleteMutation.mutateAsync,
    uploadMedia: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    addAuthor: addAuthorMutation.mutateAsync,
    removeAuthor: removeAuthorMutation.mutateAsync,
    uploadOgImage: uploadOgImageMutation.mutateAsync,
    isUploadingOgImage: uploadOgImageMutation.isPending,
  };
};
