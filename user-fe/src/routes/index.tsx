import { createFileRoute } from '@tanstack/react-router'
import { useNewsQuery } from '../query/useNewsQuery'
import NewsCard from '../components/NewsCard'
import { useEffect, useState, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2, Search, Globe, Facebook, Twitter, Instagram, Youtube, MessageCircle, Mail, Tv, Radio, Newspaper, Hash, MoreHorizontal } from 'lucide-react'
import { cn } from '../lib/utils'
import Header from '../components/Header'

export const Route = createFileRoute('/')({
  component: App,
})

const PLATFORMS = [
  { id: 'all', label: 'All Sources', icon: Globe },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'x', label: 'X / Twitter', icon: Twitter },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: MoreHorizontal }, 
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'viber', label: 'Viber', icon: MessageCircle },
  { id: 'telegram', label: 'Telegram', icon: MessageCircle },
  { id: 'reddit', label: 'Reddit', icon: Hash },
  { id: 'web', label: 'Web', icon: Globe },
  { id: 'tv', label: 'Television', icon: Tv },
  { id: 'radio', label: 'Radio', icon: Radio },
  { id: 'print', label: 'Print', icon: Newspaper },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'others', label: 'Others', icon: MoreHorizontal },
]

function App() {
  const [platform, setPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { useNewsListQuery, useNewsSearchQuery } = useNewsQuery()

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const listQuery = useNewsListQuery(platform === 'all' ? undefined : platform);
  const searchQueryResult = useNewsSearchQuery(debouncedSearch);

  const isSearching = debouncedSearch.length >= 2;
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = isSearching ? { ...searchQueryResult, fetchNextPage: () => {}, hasNextPage: false, isFetchingNextPage: false } : listQuery;

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isSearching) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage, isSearching])

  const allNews = useMemo(() => {
    if (isSearching) return searchQueryResult.data || [];
    return data?.pages.flat() || [];
  }, [isSearching, searchQueryResult.data, data?.pages]);

  return (
    <div className="min-h-screen bg-zinc-50/30 font-mukta">
      <Header bgColor="#a51719" />

      {/* Subtle Search & Filter Bar - Below Hero */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="flex flex-col gap-6">
            {/* Big Search Bar on Top */}
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="text"
                placeholder="Search keywords, claims, or viral news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:bg-white focus:border-zinc-900 transition-all text-lg shadow-sm"
              />
            </div>
            
            {/* Scrollable Platforms Filter Below */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full">
              <div className="flex items-center gap-3 pr-4">
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mr-2 whitespace-nowrap">Filter by</span>
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const active = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[12px] font-bold tracking-widest uppercase transition-all duration-200 whitespace-nowrap border",
                        active 
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-105" 
                          : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 relative">
        <div className="flex gap-8 md:gap-12">
          {/* Main Column */}
          <div className="flex-1 space-y-16">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
                <p className="text-zinc-400 text-sm font-mukta animate-pulse">Syncing timeline...</p>
              </div>
            ) : allNews.length > 0 ? (
              <>
                {allNews.map((news: any) => (
                  <div key={news.slug} className="relative">
                    <NewsCard news={news} />
                  </div>
                ))}

                {/* Infinite Scroll Trigger */}
                {!isSearching && (
                  <div ref={ref} className="h-20 flex items-center justify-center mt-8">
                    {isFetchingNextPage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                    ) : (
                      <div className="text-zinc-300 text-xs font-bold tracking-widest uppercase opacity-50">
                        {hasNextPage ? "Loading more stories" : "End of timeline"}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-zinc-100 mb-4">
                  <Search className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">No results found</h3>
                <p className="text-zinc-500 max-w-xs mx-auto text-sm">
                  We couldn't find any news matching your criteria. Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>

          {/* Timeline Column */}
          <div className="hidden lg:block w-32 relative">
            <div className="sticky top-24 h-[calc(100vh-120px)] flex flex-col items-center">
              <div className="absolute top-0 bottom-0 w-[2px] bg-zinc-100" />
              <div className="relative flex flex-col gap-8 py-4">
                {allNews.slice(0, 10).map((_: any, i: number) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full border-2 transition-all duration-500 relative z-10",
                      "bg-zinc-900 border-zinc-900 shadow-[0_0_10px_rgba(0,0,0,0.1)] scale-110"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
