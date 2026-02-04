import { createFileRoute } from '@tanstack/react-router'
import { useNewsQuery } from '../query/useNewsQuery'
import NewsCard from '../components/NewsCard'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2 } from 'lucide-react'

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
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="space-y-16">
        {groupedNews.map((group, groupIdx) => (
          <div key={groupIdx} className="relative">
            {group.items.map((news, idx) => (
              <div key={news.slug} className="group relative flex gap-8 md:gap-16 mb-12 last:mb-0">
                {/* Left Side: Date Label (Only show for first item in group) */}
                <div className="w-16 md:w-24 flex-shrink-0 pt-2">
                  {idx === 0 && (
                    <div className="sticky top-24">
                      <h2 className="text-3xl md:text-4xl font-black text-blue-600 mb-2">
                        {group.month}
                      </h2>
                      <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    </div>
                  )}
                </div>

                {/* Right Side: News Card & Timeline Line */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    {/* The horizontal line connector from dot to card (optional, based on design) */}
                    {/* <div className="absolute -left-12 top-6 w-12 h-[1px] bg-zinc-100 hidden md:block" /> */}
                    <NewsCard news={news} />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Visual separator line between month groups */}
            {groupIdx < groupedNews.length - 1 && (
              <div className="ml-24 md:ml-40 border-t border-zinc-100 my-16" />
            )}
          </div>
        ))}
      </div>

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
  )
}
