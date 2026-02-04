import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { newsApi } from "../api/get-news-api";

export const useNewsQuery = () => {
  const useNewsListQuery = (platform?: string) => {
    return useInfiniteQuery({
      queryKey: ["news-list", platform],
      queryFn: ({ pageParam = 0 }) => newsApi.getNews(pageParam, platform),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        // If the last page had items, we try next page (since pagination is date-block based)
        return lastPage.length > 0 ? allPages.length : undefined;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes (matches server cache)
    });
  };

  const useNewsSearchQuery = (query: string) => {
    return useQuery({
      queryKey: ["news-search", query],
      queryFn: () => newsApi.searchNews(query),
      enabled: query.length >= 2,
      staleTime: 1000 * 60 * 5,
    });
  };

  const useNewsDetailQuery = (slug: string) => {
    return useQuery({
      queryKey: ["news-detail", slug],
      queryFn: () => newsApi.getNewsBySlug(slug),
      enabled: !!slug,
      staleTime: 1000 * 60 * 5,
    });
  };

  return {
    useNewsListQuery,
    useNewsSearchQuery,
    useNewsDetailQuery,
  };
};
