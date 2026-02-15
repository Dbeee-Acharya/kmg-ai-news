import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ExternalLink, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

import { MediaRenderer } from './MediaRenderer';
import ShareModal from './ShareModal';

interface NewsCardProps {
  news: {
    title: string;
    content: string;
    slug: string;
    publishedAt: string;
    eventDateEn?: string | null;
    eventDateNp?: string | null;
    authors?: {
      name: string;
      portfolioLink?: string | null;
    }[] | null;
    media: {
      type: string;
      url: string;
      sortOrder: number;
    }[];
    links: {
      label?: string | null;
      url: string;
      sortOrder: number;
    }[];
    tags: string[];
  };
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, className }) => {
  const [isVertical, setIsVertical] = useState<Record<string, boolean>>({});

  const handleImageLoad = (url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth) {
      setIsVertical((prev: Record<string, boolean>) => ({ ...prev, [url]: true }));
    }
  };


  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const sortedMedia = [...(news.media || [])].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  // Re-reading user request: "only show the top 3 images and a small hint saying there is more to see"
  // So total 3 images.
  const previewMedia = sortedMedia.slice(0, 3);
  const hasMoreMedia = sortedMedia.length > 3;

  return (
    <Card className={cn("group overflow-hidden border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl relative", className)}>
      {/* Share Button */}
      <div className="absolute top-4 right-4 z-20">
        <ShareModal 
          title={news.title}
          url={`${window.location.origin}/n/${news.slug}`}
          trigger={
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all hover:bg-zinc-900 hover:text-white border border-zinc-100"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          }
        />
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left Column / Top on Mobile: Info & Media */}
        <div className="flex-[1.2] p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            {news.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="text-zinc-900">{tag}</span>
            ))}
            {news.tags.length > 0 && <span className="text-zinc-300">•</span>}
            <span>{formatDate(news.publishedAt)}</span>
          </div>

          <CardHeader className="p-0 space-y-4">
            <Link to="/n/$newsSlug" params={{ newsSlug: news.slug }}>
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 leading-[1.2] text-left hover:text-blue-600 transition-colors cursor-pointer">
                {news.title}
              </CardTitle>
            </Link>
            
            {news.eventDateNp && (
              <div className="inline-flex">
                <Badge variant="secondary" className="bg-zinc-900 text-zinc-50 rounded-md font-mono text-[10px] py-1 px-3 uppercase tracking-tighter">
                   {news.eventDateNp} {news.eventDateEn && `| ${formatDate(news.eventDateEn)}`}
                </Badge>
              </div>
            )}
          </CardHeader>

          {previewMedia.length > 0 && (
            <div className="space-y-4">
              {/* Image Preview Grid */}
              <Link to="/n/$newsSlug" params={{ newsSlug: news.slug }} className="block space-y-4">
                {/* Main Image (Top 1) */}
                <div className="rounded-xl overflow-hidden border border-zinc-100 shadow-sm bg-zinc-50">
                  <AspectRatio ratio={isVertical[previewMedia[0].url] ? 9 / 16 : 5 / 3}>
                    <MediaRenderer 
                      media={previewMedia[0]}
                      alt={news.title}
                      onLoad={(e) => handleImageLoad(previewMedia[0].url, e)}
                      className="grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
                    />
                  </AspectRatio>
                </div>

                {/* Sub-images (Next 2) */}
                {previewMedia.length > 1 && (
                  <div className="grid grid-cols-2 gap-4 relative">
                    {previewMedia.slice(1, 3).map((item: any, i: number) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-zinc-100 shadow-xs bg-zinc-50 relative">
                        <AspectRatio ratio={isVertical[item.url] ? 9 / 16 : 5 / 3}>
                          <MediaRenderer 
                            media={item}
                            alt={`${news.title} ${i + 2}`}
                            onLoad={(e) => handleImageLoad(item.url, e)}
                            className="opacity-80 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500"
                          />
                        </AspectRatio>
                        {/* More hint on the last preview thumbnail if more images exist */}
                        {i === 1 && hasMoreMedia && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-white text-xs font-bold tracking-widest uppercase">+{sortedMedia.length - 3} More</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* fallback hint if only 2 images total but more exists (unlikely with slice logic but safe) */}
                    {previewMedia.length === 2 && hasMoreMedia && (
                       <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2 pointer-events-none">
                          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-[10px] font-bold">+{sortedMedia.length - 2} MORE</Badge>
                       </div>
                    )}
                  </div>
                )}
              </Link>
            </div>
          )}
        </div>

        {/* Right Column / Middle on Mobile: Description & Links */}
        <div className="flex-1 p-6 md:p-8 md:border-l border-zinc-100 flex flex-col justify-between">
          <div className="space-y-6">
            <Link to="/n/$newsSlug" params={{ newsSlug: news.slug }} className="block text-black leading-relaxed text-sm md:text-base font-normal text-left hover:text-zinc-600 transition-colors">
              <div 
                dangerouslySetInnerHTML={{ __html: news.content }} 
                className="prose prose-zinc max-w-none text-black font-sans line-clamp-[12] text-[16px] [&_a]:text-inherit [&_a]:no-underline [&_a]:pointer-events-none [&_a]:font-inherit"
              />
            </Link>

            {news.links.length > 0 && (
              <div className="pt-6 border-t border-zinc-100">
                <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase block mb-4">Related</span>
                <div className="space-y-3">
                  {news.links.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((link: any, i: number) => (
                    <a 
                      key={i} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2 text-zinc-900 hover:text-zinc-600 transition-colors"
                    >
                      <span className="text-sm font-medium border-b border-zinc-900 group-hover:border-zinc-400 transition-all">
                        {link.label || link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </span>
                      <span className="text-zinc-400 text-xs mt-0.5 whitespace-nowrap">
                        ({link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]})
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {news.authors && news.authors.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-50 space-y-3">
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reported by</p>
               <div className="flex flex-wrap gap-4">
                  {news.authors.map((author: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 min-w-[120px]">
                      <span className="text-xs font-semibold text-zinc-900">{author.name}</span>
                      {author.portfolioLink && (
                        <a 
                          href={author.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-zinc-900 transition-colors"
                          aria-label={`Reporter ${author.name} Portfolio`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;
