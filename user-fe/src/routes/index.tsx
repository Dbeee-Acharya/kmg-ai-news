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
      <Header />

      {/* Subtle Search & Filter Bar - Below Hero */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="flex flex-col gap-6">
            {/* Big Search Bar on Top */}
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors select-none" />
              <input 
                type="text"
                placeholder="Search keywords, claims, or viral news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-14 pr-6 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all text-sm"
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
                        "flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-all duration-200 whitespace-nowrap border",
                        active 
                          ? "text-zinc-900 bg-zinc-100" 
                          : "text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
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

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 relative">
          {/* Main Column - Identical width to Search Bar */}
          <div className="space-y-0 relative">
            {/* Continuous Timeline Line - inside content area, right side */}
            <div className="hidden xl:block absolute top-8 bottom-0 w-[2px] bg-red-100" style={{ right: '-100px' }} />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
                <p className="text-zinc-400 text-sm font-mukta animate-pulse">Syncing timeline...</p>
              </div>
            ) : allNews.length > 0 ? (
              <>
                {/* Group news by date */}
                {(() => {
                  // Group news by date
                  const groupedByDate = allNews.reduce((groups: Record<string, any[]>, news: any) => {
                    const dateKey = new Date(news.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    if (!groups[dateKey]) groups[dateKey] = [];
                    groups[dateKey].push(news);
                    return groups;
                  }, {});

                  const dateGroups = Object.entries(groupedByDate) as [string, any[]][];

                  return dateGroups.map(([dateKey, newsItems], groupIndex) => (
                    <div key={dateKey} className="relative">
                      {/* Date Group Container */}
                      <div className="relative min-h-[200px]">
                        {/* Left Date Column - Sticky within this group */}
                        <div className="hidden xl:block absolute -left-48 w-32 top-0 h-full">
                          <div className="sticky top-[180px] text-right py-4">
                            <div className="text-base font-black text-zinc-900 uppercase tracking-widest">
                              {new Date(newsItems[0].publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                              {newsItems.length} {newsItems.length === 1 ? 'story' : 'stories'}
                            </div>
                          </div>
                        </div>

                        {/* Right Timeline Dots - Sticky within this group */}
                        <div className="hidden xl:block absolute top-0 h-full" style={{ right: '-105px' }}>
                          <div className="sticky top-[180px] py-4">
                            <div className="flex flex-col gap-4">
                              {newsItems.map((_: any, i: number) => (
                                <div 
                                  key={i}
                                  className={cn(
                                    "w-3 h-3 rounded-full border-2 relative z-10",
                                    "bg-[#a51719] border-[#a51719] shadow-[0_0_10px_rgba(165,23,25,0.3)]"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* News Items for this date */}
                        <div className="space-y-12 py-8">
                          {/* Mobile Date Header */}
                          <div className="xl:hidden sticky top-[140px] z-30 -mx-4 px-4 py-2 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
                            <div className="text-sm font-black text-zinc-900 uppercase tracking-widest">
                              {new Date(newsItems[0].publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              <span className="text-zinc-400 font-medium normal-case tracking-normal ml-2">
                                · {newsItems.length} {newsItems.length === 1 ? 'story' : 'stories'}
                              </span>
                            </div>
                          </div>
                          
                          {newsItems.map((news: any) => (
                            <div key={news.slug} className="relative">
                              <NewsCard news={news} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Separator between date groups */}
                      {groupIndex < dateGroups.length - 1 && (
                        <div className="border-b border-zinc-200 my-4" />
                      )}
                    </div>
                  ));
                })()}

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
                <div className="inline-flex p-4 rounded-full bg-zinc-100 mb-4 select-none">
                  <Search className="w-8 h-8 text-zinc-300 select-none" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">No results found</h3>
                <p className="text-zinc-500 max-w-xs mx-auto text-sm">
                  We couldn't find any news matching your criteria. Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
