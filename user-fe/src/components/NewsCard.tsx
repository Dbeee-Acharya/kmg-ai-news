import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  news: {
    title: string;
    content: string;
    slug: string;
    publishedAt: string;
    eventDateEn?: string | null;
    eventDateNp?: string | null;
    reporter?: {
      name: string;
      portfolioLink?: string | null;
    } | null;
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
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const firstMedia = news.media?.[0];

  return (
    <Card className={cn("overflow-hidden border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl", className)}>
      <div className="flex flex-col md:flex-row">
        {/* Left Column / Top on Mobile: Info & Media */}
        <div className="flex-1 p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            {news.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-zinc-900">{tag}</span>
            ))}
            {news.tags.length > 0 && <span className="text-zinc-300">•</span>}
            <span>{formatDate(news.publishedAt)}</span>
          </div>

          <CardHeader className="p-0 space-y-3">
            <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight text-left">
              {news.title}
            </CardTitle>
            
            {news.eventDateNp && (
              <div className="inline-flex">
                <Badge variant="secondary" className="bg-zinc-900 text-zinc-50 rounded-md font-mono text-[10px] py-1 px-3 uppercase tracking-tighter">
                  {news.eventDateNp} {news.eventDateEn && `| ${formatDate(news.eventDateEn)}`}
                </Badge>
              </div>
            )}
          </CardHeader>

          {firstMedia && (
            <div className="mt-6 rounded-lg overflow-hidden border border-zinc-100">
              <AspectRatio ratio={16 / 9}>
                <img 
                  src={firstMedia.url} 
                  alt={news.title}
                  className="object-cover w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                />
              </AspectRatio>
            </div>
          )}
        </div>

        {/* Right Column / Middle on Mobile: Description & Links */}
        <div className="flex-1 p-6 md:p-8 md:border-l border-zinc-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-zinc-700 leading-relaxed text-sm md:text-base font-light text-left">
              <div 
                dangerouslySetInnerHTML={{ __html: news.content }} 
                className="prose prose-zinc max-w-none text-zinc-700 font-sans line-clamp-[12]"
              />
            </div>

            {news.links.length > 0 && (
              <div className="pt-6 border-t border-zinc-100">
                <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase block mb-4">Related</span>
                <div className="space-y-3">
                  {news.links.sort((a, b) => a.sortOrder - b.sortOrder).map((link, i) => (
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

          {news.reporter && (
            <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reported by</p>
                  <p className="text-xs font-semibold text-zinc-900">{news.reporter.name}</p>
                </div>
              </div>
              {news.reporter.portfolioLink && (
                <a 
                  href={news.reporter.portfolioLink}
                  target=""
                  className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  aria-label="Reporter Portfolio"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;
