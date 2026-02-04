import { createFileRoute } from '@tanstack/react-router'
import { useNewsQuery } from '../query/useNewsQuery'
import NewsCard from '../components/NewsCard'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { useNewsListQuery } = useNewsQuery()
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useNewsListQuery()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  const allNews = data?.pages.flat() || []

  // Group news by month for the left labels
  const groupedNews: { month: string; items: any[] }[] = []
  allNews.forEach((item) => {
    const month = new Date(item.publishedAt).toLocaleString('en-US', { month: 'short' })
    const lastGroup = groupedNews[groupedNews.length - 1]
    
    if (lastGroup && lastGroup.month === month) {
      lastGroup.items.push(item)
    } else {
      groupedNews.push({ month, items: [item] })
    }
  })

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="flex gap-8 md:gap-12">
        {/* Left/Main Column: News Cards */}
        <div className="flex-1 space-y-16">
          {allNews.map((news) => (
            <div key={news.slug} className="relative">
              <NewsCard news={news} />
            </div>
          ))}

          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="h-20 flex items-center justify-center mt-8">
            {isFetchingNextPage ? (
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            ) : hasNextPage ? (
              <div className="text-zinc-400 text-sm font-medium">Scrolling for more...</div>
            ) : (
              <div className="text-zinc-300 text-sm italic">You've reached the end of the timeline</div>
            )}
          </div>
        </div>

        {/* Right Column: Git-branch style Timeline */}
        <div className="hidden lg:block w-32 relative">
          <div className="sticky top-24 h-[calc(100vh-120px)] flex flex-col items-center">
            {/* The vertical line */}
            <div className="absolute top-0 bottom-0 w-[2px] bg-zinc-100" />
            
            {/* Dynamic dots based on news count / progress */}
            <div className="relative flex flex-col gap-8 py-4">
              {allNews.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-all duration-500 relative z-10",
                    i < (data?.pages.flat().length || 0) // Basic implementation: all items fetched have dots
                      ? "bg-zinc-900 border-zinc-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                      : "bg-white border-zinc-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
